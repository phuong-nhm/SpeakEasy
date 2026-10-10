import asyncio
import os
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langchain_mcp_adapters.tools import load_mcp_tools
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
async def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    server_script = os.path.join(current_dir, "mcp_server.py")
    python_executable = os.path.join(current_dir, "venv", "Scripts", "python.exe")
    server_params = StdioServerParameters(
    command=python_executable,
    args=[server_script]
)
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools=await load_mcp_tools(session)
            model_name=os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
            llm=ChatGoogleGenerativeAI(model=model_name, temperature=0.2,max_output_tokens=1024)
            agent =create_react_agent(llm, tools)
            query = "Level đầu tiên có những chapter nào?"
            print(f"\n👤 User: {query}\n")

            # Sử dụng ainvoke vì Agent chạy trong môi trường async
            result = await agent.ainvoke({"messages": [("user", query)]})
            
            print("🤖 Agent Response:")
            print(result["messages"][-1].content)
if __name__ == "__main__":
    asyncio.run(main())