from http import client
import json
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import ToolMessage
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
agent=None
memory = MemorySaver()
@asynccontextmanager
async def lifespan (app: FastAPI):
    global agent
    current_dir = os.path.dirname(os.path.abspath(__file__))
    server_script_path = os.path.join(current_dir, "mcp_server.py")
    python_executable = os.path.join(current_dir, "venv", "Scripts", "python.exe")
    server_params=StdioServerParameters(
        command=python_executable,
        args=[server_script_path])
    async with stdio_client(server_params) as (read,write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            mcp_tools = await load_mcp_tools(session)
            model_name=os.getenv("GEMINI_MODEL_1", "gemini-3.5-flash")
            llm=ChatGoogleGenerativeAI(model=model_name,temperature=0.2,max_output_tokens=1024)
            agent = create_react_agent(
                llm,
                mcp_tools,
                checkpointer=memory)
            yield
app=FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép mọi domain kết nối (hoặc điền cụ thể domain frontend của cậu vào đây)
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các phương thức (GET, POST, OPTIONS,...)
    allow_headers=["*"],  # Cho phép tất cả các headers
)
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
@app.post("/chat")
async def chat(request: ChatRequest):
    config = {"configurable": {"thread_id": request.thread_id}}
    result = await agent.ainvoke({"messages": [("user", request.message)]}, config=config)
    reply = extract_text(result["messages"][-1].content)
    return {"reply": reply}
@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    config={"configurable":{"thread_id":request.thread_id}}
    async def event_generator():
        async for event in agent.astream(
            {"messages": [("user", request.message)]}, 
            config=config, stream_mode="messages"
        ):
# Xử lý an toàn: dù LangGraph trả về 1 hay 2 phần tử đều không sợ lỗi
            if isinstance(event, (list, tuple)) and len(event) >= 2:
                message_chunk, metadata = event
            else:
                message_chunk = event
            if isinstance(message_chunk, ToolMessage):
                continue
            content = extract_text(getattr(message_chunk, "content", None))
            # Kiểm tra xem chunk có nội dung text không rồi mới yield về
            if content:
                yield f"data: {json.dumps({'content': content}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")