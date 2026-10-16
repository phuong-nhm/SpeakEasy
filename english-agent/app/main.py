from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_mcp_adapters.tools import load_mcp_tools
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import os
from app.config import ALLOWED_ORIGINS, MCP_SERVER_PATH, PYTHON_EXECUTABLE
from app.agents.factory import build_agent
from app.routes.chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    server_params = StdioServerParameters(
        command=PYTHON_EXECUTABLE,
        args=[MCP_SERVER_PATH],
        env=dict(os.environ),
    )
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            mcp_tools = await load_mcp_tools(session)
            app.state.agent = build_agent(mcp_tools)
            yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)

# test main deploy ne