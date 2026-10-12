from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

from app.config import MODEL_NAME, TEMPERATURE, MAX_OUTPUT_TOKENS

memory = MemorySaver()


def build_agent(mcp_tools):
    llm = ChatGoogleGenerativeAI(
        model=MODEL_NAME,
        temperature=TEMPERATURE,
        max_output_tokens=MAX_OUTPUT_TOKENS,
    )
    return create_react_agent(llm, mcp_tools, checkpointer=memory)