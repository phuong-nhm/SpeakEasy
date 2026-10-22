import json

from fastapi import APIRouter, Request,Depends,HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import ToolMessage,HumanMessage

from app.deps import get_current_user, get_current_token
from guardrails_config import validate_input_safely,validate_output_safely  # 🛡️ Import hàm bảo vệ input
router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default_session"


def extract_text(content) -> str:
    """Chuẩn hóa content trả về, vì Gemini đôi khi trả list các phần thay vì string thuần."""
    if isinstance(content, list):
        return "".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in content
        )
    return content or ""


@router.post("/chat")
async def chat(body: ChatRequest, request: Request,current_user_id: str = Depends(get_current_user),token: str = Depends(get_current_token)):
    if not await validate_input_safely(body.message):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nội dung câu hỏi chứa từ ngữ không phù hợp với tiêu chuẩn học tập."
        )
    agent = request.app.state.agent
    secure_thread_id = f"{current_user_id}_{body.thread_id}"
    config = {"configurable": {"thread_id": secure_thread_id,"access_token": token}}
    result = await agent.ainvoke(
        {"messages": [HumanMessage(content=body.message)]}, config=config
    )
    reply = extract_text(result["messages"][-1].content)
    safe_reply = validate_output_safely(reply)
    return {"reply": safe_reply}


@router.post("/chat/stream")
async def chat_stream(
    body: ChatRequest, 
    request: Request,
    current_user_id: str = Depends(get_current_user),
    token: str = Depends(get_current_token)
):
    if not await validate_input_safely(body.message):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nội dung câu hỏi chứa từ ngữ không phù hợp với tiêu chuẩn học tập."
        )
    print(f"🔥 ĐÃ XÁC THỰC THÀNH CÔNG! User ID lấy được từ token là: {current_user_id}")
    agent = request.app.state.agent
    secure_thread_id = f"{current_user_id}_{body.thread_id}"
    
    config = {
        "configurable": {
            "thread_id": secure_thread_id,
            "access_token": token
        }
    }
    
    async def event_generator():
        try:
            async for event in agent.astream(
                {"messages": [HumanMessage(content=body.message)]},
                config=config,
                stream_mode="messages",
            ):
                # 🛡️ BƯỚC 1: Bóc tách an toàn tuyệt đối chống lỗi tuple
                message_chunk = None
                metadata = {}

                if isinstance(event, (list, tuple)):
                    if len(event) >= 2:
                        message_chunk, metadata = event[0], event[1]
                    elif len(event) == 1:
                        message_chunk = event[0]
                else:
                    message_chunk = event

                # Nếu message_chunk vẫn lòi ra tuple hoặc bị None thì lập tức bỏ qua
                if not message_chunk or isinstance(message_chunk, tuple):
                    continue

                # 🛡️ BƯỚC 2: Kiểm tra metadata an toàn để bỏ qua node supervisor
                current_node = ""
                if isinstance(metadata, dict):
                    current_node = metadata.get("langgraph_node", "")

                if current_node == "supervisor":
                    continue  # Bỏ qua không stream nội dung từ sếp tổng

                # 1. Bắt khoảnh khắc LLM quyết định gọi Tool (tool_start)
                if hasattr(message_chunk, "tool_call_chunks") and message_chunk.tool_call_chunks:
                    for tc in message_chunk.tool_call_chunks:
                        if isinstance(tc, dict):
                            tool_name = tc.get("name")
                            if tool_name:
                                payload = {"type": "tool_start", "tool": tool_name}
                                yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

                # 2. Bắt khoảnh khắc Tool thực thi xong trả kết quả về (tool_end)
                if isinstance(message_chunk, ToolMessage):
                    payload = {"type": "tool_end", "tool": message_chunk.name}
                    yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"
                    continue

                # 3. Lấy chữ LLM đang stream trả về cho user (token) - ĐẢM BẢO KHÔNG BAO GIỜ GỌI NHẦM TUPLE
                if hasattr(message_chunk, "content"):
                    raw_content = message_chunk.content
                    # Chặn tuyệt đối nếu content vô tình là tuple
                    if isinstance(raw_content, tuple):
                        continue
                        
                    content = extract_text(raw_content)
                    if content and not str(content).strip().startswith('{"next_agent"'):
                        safe_content = validate_output_safely(content)
                        payload = {"type": "token", "content": safe_content}
                        yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

            # 4. Báo hiệu hoàn thành phiên chat
            yield f"data: {json.dumps({'type': 'done'}, ensure_ascii=False)}\n\n"

        except Exception as e:
            # 5. Bắt lỗi phát sinh nếu có để không sập luồng stream
            error_payload = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_payload, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")