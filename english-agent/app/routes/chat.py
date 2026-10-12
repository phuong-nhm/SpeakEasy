import json

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import ToolMessage

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
async def chat(body: ChatRequest, request: Request):
    agent = request.app.state.agent
    config = {"configurable": {"thread_id": body.thread_id}}
    result = await agent.ainvoke(
        {"messages": [("user", body.message)]}, config=config
    )
    reply = extract_text(result["messages"][-1].content)
    return {"reply": reply}


@router.post("/chat/stream")
async def chat_stream(body: ChatRequest, request: Request):
    agent = request.app.state.agent
    config = {"configurable": {"thread_id": body.thread_id}}

    async def event_generator():
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

            # Bỏ qua kết quả thô của tool, chỉ lấy chữ LLM đang trả lời
            if isinstance(message_chunk, ToolMessage):
                continue

            content = extract_text(getattr(message_chunk, "content", None))
            if content:
                yield f"data: {json.dumps({'content': content}, ensure_ascii=False)}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")