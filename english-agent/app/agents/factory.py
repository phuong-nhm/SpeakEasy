from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage,SystemMessage
from typing import Literal
from pydantic import BaseModel, Field
from langgraph.graph.message import add_messages
from typing import Annotated
import operator
from langchain_core.messages import BaseMessage
from typing_extensions import TypedDict
from app.config import MODEL_NAME, TEMPERATURE, MAX_OUTPUT_TOKENS,VALIDATE_MODEL

memory = MemorySaver()
MAX_HISTORY_MESSAGES = 10

def get_recent_messages(messages: list[BaseMessage]) -> list[BaseMessage]:
    """Chỉ lấy N message gần nhất để tránh context phình to dần theo thời gian."""
    return messages[-MAX_HISTORY_MESSAGES:]
# --- 1. SYSTEM PROMPTS CHO TỪNG AGENT ---
TUTOR_PROMPT = """
Bạn là Gia sư Tiếng Anh chuyên giảng dạy kiến thức, từ vựng, ngữ pháp, bài học và đoạn nghe. 
Hãy giải thích tận tình bằng tiếng Việt.
🚨 QUY TẮC TỐI CAO: TUYỆT ĐỐI KHÔNG IN ID/GUID ra màn hình chat cho người dùng thấy.
📝 FORMAT: Khi liệt kê từ vựng/nội dung, viết gọn, không để dòng trống giữa các mục. Mỗi từ chỉ cần 1-2 dòng thông tin ngắn gọn (nghĩa, từ loại), không tách đoạn quá nhiều.
"""

PROGRESS_PROMPT = """
Bạn là Quản lý tiến độ học tập, chuyên xem profile, tiến độ, lịch sử bài viết và các bài tập đến hạn ôn tập (Spaced Repetition).
🚨 QUY TẮC TỐI CAO: TUYỆT ĐỐI KHÔNG IN ID/GUID ra màn hình chat cho người dùng thấy.
📝 FORMAT: Trình bày gọn, không để dòng trống giữa các mục. Mỗi mục chỉ cần 1-2 dòng thông tin ngắn gọn, không tách đoạn quá nhiều.
"""

EVALUATOR_PROMPT = """
Bạn là Chuyên gia Chấm bài và Kiểm tra đáp án. 
Hãy luôn hỏi lại để xác nhận (confirm=True) trước khi nộp bài luận hoặc bài tập quan trọng.
🚨 QUY TẮC TỐI CAO: TUYỆT ĐỐI KHÔNG IN ID/GUID ra màn hình chat cho người dùng thấy.
📝 FORMAT: Trình bày gọn, không để dòng trống giữa các mục. Mỗi mục chỉ cần 1-2 dòng thông tin ngắn gọn, không tách đoạn quá nhiều.
"""
SUPERVISOR_SYSTEM_PROMPT = """
Bạn là bộ định tuyến trung tâm (Supervisor) cho một hệ thống học tiếng Anh. 
Nhiệm vụ của bạn là đọc lịch sử tin nhắn và quyết định xem ai là người phù hợp nhất để xử lý yêu cầu tiếp theo của học viên:
- "tutor": Dùng khi học viên hỏi kiến thức, từ vựng, ngữ pháp, nội dung bài học, level, chapter hoặc trò chuyện học tập chung.
- "progress": Dùng khi học viên muốn xem tiến độ, hồ sơ cá nhân, lịch sử làm bài, hoặc các bài tập đến hạn ôn tập (Spaced Repetition).
- "evaluator": Dùng khi học viên muốn chấm điểm bài tập, nộp bài luận, hoặc kiểm tra đáp án câu hỏi (sentence, matching, listening, writing).
- "FINISH": Dùng khi cuộc trò chuyện đã kết thúc hoàn toàn.
"""
class SupervisorState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    next: str
def build_agent(mcp_tools):
    llm = ChatGoogleGenerativeAI(
        model=MODEL_NAME,
        temperature=TEMPERATURE,
        max_output_tokens=MAX_OUTPUT_TOKENS,
    )
    supervisor_llm = ChatGoogleGenerativeAI(
    model=VALIDATE_MODEL,  # dùng model rẻ thay vì MODEL_NAME
    temperature=0,
)
    tutor_tools = [t for t in mcp_tools if t.name in [
        "get_levels", "get_chapters", "get_lessons", "get_vocabulary_by_lesson",
        "get_sentence_exercises_by_lesson", "get_grammar_notes_by_lesson",
        "get_grammar_notes_by_chapter", "get_lesson_content",
        "get_listening_passages", "get_available_writing_topics"
    ]]

    progress_tools = [t for t in mcp_tools if t.name in [
        "get_my_profile", "get_my_progress", "get_chapter_progress",
        "get_due_reviews", "get_writing_history", "get_writing_detail"
    ]]

    evaluator_tools = [t for t in mcp_tools if t.name in [
        "check_sentence_answer", "check_matching_answer",
        "submit_listening_multiple_choice", "submit_listening_essay", "submit_writing"
    ]]
    tutor_agent = create_react_agent(llm, tutor_tools, prompt=TUTOR_PROMPT)
    progress_agent = create_react_agent(llm, progress_tools, prompt=PROGRESS_PROMPT)
    evaluator_agent = create_react_agent(llm, evaluator_tools, prompt=EVALUATOR_PROMPT)
    class RouterResponse(BaseModel):
        next_agent: Literal["tutor", "progress", "evaluator", "FINISH"] = Field(
            description="Agent tiếp theo cần gọi dựa trên yêu cầu của học viên."
        )
    async def call_tutor(state: SupervisorState):
        recent = get_recent_messages(state["messages"])
        result = await tutor_agent.ainvoke({"messages": recent})
        return {"messages": result["messages"]}
        
    async def call_progress(state: SupervisorState):
        recent = get_recent_messages(state["messages"])
        result = await progress_agent.ainvoke({"messages": recent})
        return {"messages": result["messages"]}

    async def call_evaluator(state: SupervisorState):
        recent = get_recent_messages(state["messages"])
        result = await evaluator_agent.ainvoke({"messages": recent})
        return {"messages": result["messages"]}

    class RouterResponse(BaseModel):
        next_agent: Literal["tutor", "progress", "evaluator", "FINISH"] = Field(
            description="Agent tiếp theo cần gọi dựa trên yêu cầu của học viên."
        )

    async def supervisor_node(state: SupervisorState):
        messages = state["messages"]
        last_msg = messages[-1].content if messages else ""
        
        structured_llm = supervisor_llm.with_structured_output(RouterResponse)
        recent = get_recent_messages(messages)
        prompt = [SystemMessage(content=SUPERVISOR_SYSTEM_PROMPT)] + recent
        
        # Gọi ainvoke bất đồng bộ
        response = await structured_llm.ainvoke(prompt)
        
        print(f"🎯 [SUPERVISOR ROUTER] Đã quyết định bẻ lái sang phòng: --> 【 {response.next_agent.upper()} 】 <--\n")
        return {"next": response.next_agent}


    workflow = StateGraph(SupervisorState)

    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("tutor", call_tutor)
    workflow.add_node("progress", call_progress)
    workflow.add_node("evaluator", call_evaluator)
    workflow.set_entry_point("supervisor")

    workflow.add_conditional_edges(
        "supervisor",
        lambda x: x["next"],
        {
            "tutor": "tutor",
            "progress": "progress",
            "evaluator": "evaluator",
            "FINISH": END
        }
    )
    workflow.add_edge("tutor", END)
    workflow.add_edge("progress", END)
    workflow.add_edge("evaluator", END)
    return workflow.compile(checkpointer=memory)


    # def supervisor_node(state: SupervisorState):
    #     messages = state["messages"]
    #     last_message = messages[-1].content.lower() if messages else ""
        
    #     # Logic phân tích ý định nhanh (có thể nâng cấp lên LLM router nếu muốn)
    #     if any(kw in last_message for kw in ["chấm", "nộp", "submit", "check đáp án", "đáp án"]):
    #         return {"next": "evaluator"}
    #     elif any(kw in last_message for kw in ["tiến độ", "lịch sử", "ôn tập", "hồ sơ", "profile", "due"]):
    #         return {"next": "progress"}
    #     elif any(kw in last_message for kw in ["level", "chapter", "lesson", "từ vựng", "ngữ pháp", "học", "bài giảng"]):
    #         return {"next": "tutor"}
    #     else:
    #         # Mặc định điều phối về cho gia sư kiến thức tổng quát hoặc tự trả lời
    #         return {"next": "tutor"}