from mcp.server.fastmcp  import FastMCP
import requests
import os
from urllib3.exceptions import InsecureRequestWarning
from langchain_core.runnables import ensure_config

BACKEND_URL = os.getenv("BACKEND_URL", "https://localhost:44326")

mcp = FastMCP("english-learning-tools")
requests.urllib3.disable_warnings(InsecureRequestWarning)
@mcp.tool()
def get_levels() -> str:
    """Lấy danh sách các Level học tiếng Anh hiện có trong hệ thống.

    👉 LƯU Ý BẮT BUỘC CHO AI:
    - Dùng ID của level để gọi tool get_chapters tiếp theo.
    - TUYỆT ĐỐI KHÔNG hiển thị mã ID/GUID ra câu trả lời cho người dùng. Trình bày sạch sẽ, dễ nhìn.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    
    headers = {}
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    response = requests.get(f"{BACKEND_URL}/api/app/level", headers=headers, verify=False)
    response.raise_for_status()
    return response.text  # trả JSON dạng string luôn cho đơn giản
@mcp.tool()
def get_chapters(level_id: str) -> str:
    """Lấy danh sách các Chapter (chương học) thuộc một Level cụ thể.

    Args:
        level_id: Mã định danh của Level cần lấy danh sách chapter.

    👉 LƯU Ý BẮT BUỘC CHO AI:
    - Dùng chapter_id nhận được để gọi tiếp tool get_lessons nếu cần.
    - KHÔNG BAO GIỜ in mã ID/GUID ra màn hình chat của người dùng.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {}
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    response = requests.get(f"{BACKEND_URL}/api/app/chapter/by-level/{level_id}", headers=headers, verify=False)
    response.raise_for_status()
    return response.text  # trả JSON dạng string luôn cho đơn giản
@mcp.tool()
def get_lessons(chapter_id: str) -> str:
    """Lấy danh sách các Lesson (bài học chi tiết) thuộc một Chapter cụ thể.

    Args:
        chapter_id: Mã định danh của Chapter cần lấy danh sách bài học.

    👉 LƯU Ý BẮT BUỘC CHO AI:
    - TUYỆT ĐỐI KHÔNG in mã ID/GUID ra kết quả hiển thị cho người dùng.
    - Chỉ trình bày tên bài học (title) và mô tả ngắn gọn (description) một cách trực quan, sạch đẹp.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {}
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    response = requests.get(f"{BACKEND_URL}/api/app/lesson/by-chapter/{chapter_id}", headers=headers, verify=False)
    response.raise_for_status()
    return response.text  # trả JSON dạng string luôn cho đơn giản
@mcp.tool()
def get_vocabulary_by_lesson(lesson_id: str) -> str:
    """Lấy danh sách từ vựng thuộc một bài học (lesson) cụ thể.

    Args:
        lesson_id: Mã định danh (ID) của bài học.

    👉 LƯU Ý BẮT BUỘC CHO AI:
    - Trình bày danh sách từ vựng, nghĩa và ví dụ một cách rõ ràng, dễ học.
    - KHÔNG hiển thị ID/GUID ra màn hình chat.
    """
    config=ensure_config()
    access_token=config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    response = requests.get(f"{BACKEND_URL}/api/app/vocabulary/by-lesson/{lesson_id}", headers=headers, verify=False)
    response.raise_for_status()
    return response.text
@mcp.tool()
def get_sentence_exercises_by_lesson(lesson_id: str) -> str:
    """Lấy danh sách bài tập câu (sentence exercises) theo bài học.

    Args:
        lesson_id: Mã định danh (ID) của bài học.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    response = requests.get(f"{BACKEND_URL}/api/app/sentence-exercise/by-lesson/{lesson_id}", headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def get_grammar_notes_by_lesson(lesson_id: str) -> str:
    """Lấy ghi chú ngữ pháp (grammar notes) theo bài học.

    Args:
        lesson_id: Mã định danh (ID) của bài học.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    response = requests.get(f"{BACKEND_URL}/api/app/grammar-note/get-by-lesson", params={"lessonId": lesson_id}, headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def get_grammar_notes_by_chapter(chapter_id: str) -> str:
    """Lấy tất cả ghi chú ngữ pháp thuộc một chương học (chapter).

    Args:
        chapter_id: Mã định danh (ID) của chương học.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    response = requests.get(f"{BACKEND_URL}/api/app/grammar-note/by-chapter/{chapter_id}", headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def get_lesson_content(lesson_id: str) -> str:
    """Lấy nội dung chi tiết của một bài học (Yêu cầu đăng nhập).

    Args:
        lesson_id: Mã định danh (ID) của bài học.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    response = requests.get(f"{BACKEND_URL}/api/app/lesson/lesson-content/{lesson_id}", headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def get_listening_passages(chapter_id: str) -> str:
    """Lấy danh sách đoạn văn nghe (listening passages) theo chapter (Cho phép ẩn danh).

    Args:
        chapter_id: Mã định danh (ID) của chương học.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    response = requests.get(f"{BACKEND_URL}/api/app/listening-passage/for-learner/{chapter_id}", headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def get_available_writing_topics(chapter_id: str, topic_type: str = "") -> str:
    """Lấy danh sách chủ đề viết luận khả dụng theo chapter.

    Args:
        chapter_id: Mã định danh (ID) của chương học.
        topic_type: Loại chủ đề (tùy chọn).
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    params = {}
    if topic_type:
        params["topicType"] = topic_type
        
    response = requests.get(f"{BACKEND_URL}/api/app/writing-topic/available-topic/{chapter_id}", params=params, headers=headers, verify=False)
    response.raise_for_status()
    return response.text


# ==========================================
# GIAI ĐOẠN 2A: ĐỌC DỮ LIỆU CÁ NHÂN (GET)
# ==========================================

@mcp.tool()
def get_my_profile() -> str:
    """Lấy thông tin tài khoản và hồ sơ cá nhân của học viên đang đăng nhập."""
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    response = requests.get(f"{BACKEND_URL}/api/account/my-profile", headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def get_my_progress() -> str:
    """Lấy tiến độ học tập tổng quan của học viên."""
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    response = requests.get(f"{BACKEND_URL}/api/app/user-progress/my-progress", headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def get_chapter_progress(chapter_id: str) -> str:
    """Lấy tiến độ hoàn thành chi tiết của một chương học (chapter) cụ thể.

    Args:
        chapter_id: Mã định danh (ID) của chương học.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    response = requests.get(f"{BACKEND_URL}/api/app/user-progress/progress-by-chapter/{chapter_id}", headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def get_due_reviews() -> str:
    """Lấy danh sách các bài học/từ vựng cần ôn tập đến hạn (Spaced Repetition / Due Reviews)."""
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    response = requests.get(f"{BACKEND_URL}/api/app/user-lesson-review/due-reviews", headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def get_writing_history() -> str:
    """Lấy lịch sử các bài viết luận (writing) mà học viên đã nộp."""
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    response = requests.get(f"{BACKEND_URL}/api/app/user-writing/history", headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def get_writing_detail(writing_id: str) -> str:
    """Lấy chi tiết bài viết luận và điểm số/nhận xét kèm theo của một bài viết cụ thể.

    Args:
        writing_id: Mã định danh (ID) của bài viết.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}),get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    response = requests.get(f"{BACKEND_URL}/api/app/user-writing/detail/{writing_id}", headers=headers, verify=False)
    response.raise_for_status()
    return response.text
# @mcp.tool()
# def mark_lesson_completed(lesson_id: str, confirm: bool = False) -> str:
#     """Đánh dấu một bài học là đã hoàn thành. 
    
#     Args:
#         lesson_id: ID của bài học cần hoàn thành.
#         confirm: BẮT BUỘC phải là true nếu người dùng đã thực sự đồng ý xác nhận hoàn thành bài học này. Mặc định là false.
#     """
#     if not confirm:
#         return (
#             "⚠️ YÊU CẦU XÁC NHẬN: Bạn có chắc chắn muốn đánh dấu hoàn thành bài học này không? "
#             "Hãy hỏi lại người dùng hoặc yêu cầu họ xác nhận đồng ý trước khi gọi lại tool này với tham số confirm=True."
#         )

#     config = ensure_config()
#     access_token = config.get("configurable", {}).get("access_token")
#     headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}

#     # Gọi API sang hệ thống .NET/ABP thực hiện đổi trạng thái
#     response = requests.post(
#         f"{BACKEND_URL}/api/app/lesson/{lesson_id}/complete", 
#         headers=headers, 
#         verify=False
#     )
#     response.raise_for_status()
#     return "Đã đánh dấu hoàn thành bài học thành công trên hệ thống!"
# ==========================================
# GIAI ĐOẠN 2B: TOOL CHẤM BÀI & GHI DỮ LIỆU (POST)
# ==========================================

@mcp.tool()
def check_sentence_answer(exercise_id: str, user_answer: str) -> str:
    """Kiểm tra đáp án bài tập câu (sentence exercise) của học viên.

    Args:
        exercise_id: ID của câu hỏi/bài tập.
        user_answer: Đáp án do học viên nhập vào.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    payload = {
        "exerciseId": exercise_id,
        "userAnswer": user_answer
    }
    
    response = requests.post(f"{BACKEND_URL}/api/app/sentence-exercise/check-answer", json=payload, headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def check_matching_answer(game_id: str, matched_pairs: str) -> str:
    """Kiểm tra kết quả trò chơi nối từ (matching game).

    Args:
        game_id: ID của trò chơi.
        matched_pairs: Dữ liệu các cặp nối do học viên thực hiện.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    payload = {
        "gameId": game_id,
        "matchedPairs": matched_pairs
    }
    
    response = requests.post(f"{BACKEND_URL}/api/app/matching-game/check-answer", json=payload, headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def submit_listening_multiple_choice(passage_id: str, selected_option: str) -> str:
    """Nộp đáp án trắc nghiệm bài nghe (listening multiple choice).

    Args:
        passage_id: ID của đoạn nghe.
        selected_option: Đáp án học viên chọn.
    """
    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    payload = {
        "passageId": passage_id,
        "selectedOption": selected_option
    }
    
    response = requests.post(f"{BACKEND_URL}/api/app/user-listening-answer/submit-multiple-choice", json=payload, headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def submit_listening_essay(passage_id: str, essay_content: str, confirm: bool = False) -> str:
    """Nộp bài luận nghe (listening essay) để hệ thống AI chấm điểm (Tốn token).

    Args:
        passage_id: ID đoạn nghe.
        essay_content: Nội dung bài luận của học viên.
        confirm: BẮT BUỘC phải là true nếu học viên đã đồng ý nộp bài. Mặc định là false.
    """
    if not confirm:
        return (
            "⚠️ XÁC NHẬN NỘP BÀI: Bạn có chắc chắn muốn nộp bài luận nghe này để hệ thống chấm điểm không? "
            "Hãy hỏi lại học viên và chỉ gọi lại tool này với confirm=True khi họ đồng ý."
        )

    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    payload = {
        "passageId": passage_id,
        "essayContent": essay_content
    }
    
    response = requests.post(f"{BACKEND_URL}/api/app/user-listening-answer/submit-essay", json=payload, headers=headers, verify=False)
    response.raise_for_status()
    return response.text

@mcp.tool()
def submit_writing(topic_id: str, content: str, confirm: bool = False) -> str:
    """Nộp bài viết luận (writing topic) để hệ thống AI chấm điểm và nhận xét (Tốn token).

    Args:
        topic_id: ID chủ đề viết.
        content: Nội dung bài viết của học viên.
        confirm: BẮT BUỘC phải là true nếu học viên đã đồng ý nộp bài. Mặc định là false.
    """
    if not confirm:
        return (
            "⚠️ XÁC NHẬN NỘP BÀI VIẾT: Bạn có chắc chắn muốn nộp bài viết luận này để hệ thống chấm điểm chi tiết không? "
            "Hãy xác nhận với học viên trước khi tiến hành nộp."
        )

    config = ensure_config()
    access_token = config.get("configurable", {}).get("access_token")
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    
    payload = {
        "topicId": topic_id,
        "content": content
    }
    
    response = requests.post(f"{BACKEND_URL}/api/app/user-writing/submit-writing", json=payload, headers=headers, verify=False)
    response.raise_for_status()
    return response.text
if __name__ == "__main__":
    mcp.run(transport="stdio")
    