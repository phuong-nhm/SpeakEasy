import json

from fastapi import APIRouter, Request,Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import ToolMessage
from app.deps import get_current_user, get_current_token
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
    agent = request.app.state.agent
    secure_thread_id = f"{current_user_id}_{body.thread_id}"
    config = {"configurable": {"thread_id": secure_thread_id,"access_token": token}}
    result = await agent.ainvoke(
        {"messages": [("user", body.message)]}, config=config
    )
    reply = extract_text(result["messages"][-1].content)
    return {"reply": reply}


# @router.post("/chat/stream")
# async def chat_stream(body: ChatRequest, request: Request,current_user_id: str = Depends(get_current_user),token: str = Depends(get_current_token)):
#     print(f"🔥 ĐÃ XÁC THỰC THÀNH CÔNG! User ID lấy được từ token là: {current_user_id}")
#     agent = request.app.state.agent
#     secure_thread_id = f"{current_user_id}_{body.thread_id}"
#     config = {"configurable": {"thread_id": secure_thread_id,"access_token": token}}
    
#     async def event_generator():
#         async for event in agent.astream(
#             {"messages": [("user", body.message)]},
#             config=config,
#             stream_mode="messages",
#         ):
#             # Xử lý an toàn: dù LangGraph trả về 1 hay 2 phần tử đều không sợ lỗi
#             if isinstance(event, (list, tuple)) and len(event) >= 2:
#                 message_chunk, metadata = event
#             else:
#                 message_chunk = event

#             # Bỏ qua kết quả thô của tool, chỉ lấy chữ LLM đang trả lời
#             if isinstance(message_chunk, ToolMessage):
#                 continue

#             content = extract_text(getattr(message_chunk, "content", None))
#             if content:
#                 yield f"data: {json.dumps({'content': content}, ensure_ascii=False)}\n\n"

#         yield "data: [DONE]\n\n"

#     return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/chat/stream")
async def chat_stream(
    body: ChatRequest, 
    request: Request,
    current_user_id: str = Depends(get_current_user),
    token: str = Depends(get_current_token)
):
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
                {"messages": [("user", body.message)]},
                config=config,
                stream_mode="messages",
            ):
                # Xử lý an toàn: dù LangGraph trả về 1 hay 2 phần tử đều không sợ lỗi
                if isinstance(event, (list, tuple)) and len(event) >= 2:
                    message_chunk, metadata = event
                else:
                    message_chunk = event

                # 1. Bắt khoảnh khắc LLM quyết định gọi Tool (tool_start)
                if hasattr(message_chunk, "tool_call_chunks") and message_chunk.tool_call_chunks:
                    for tc in message_chunk.tool_call_chunks:
                        tool_name = tc.get("name")
                        if tool_name:
                            payload = {"type": "tool_start", "tool": tool_name}
                            yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

                # 2. Bắt khoảnh khắc Tool thực thi xong trả kết quả về (tool_end)
                if isinstance(message_chunk, ToolMessage):
                    payload = {"type": "tool_end", "tool": message_chunk.name}
                    yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"
                    continue

                # 3. Lấy chữ LLM đang stream trả về cho user (token)
                content = extract_text(getattr(message_chunk, "content", None))
                if content:
                    payload = {"type": "token", "content": content}
                    yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

            # 4. Báo hiệu hoàn thành phiên chat
            yield f"data: {json.dumps({'type': 'done'}, ensure_ascii=False)}\n\n"

        except Exception as e:
            # 5. Bắt lỗi phát sinh nếu có
            error_payload = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_payload, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")