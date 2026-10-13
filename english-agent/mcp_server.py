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
if __name__ == "__main__":
    mcp.run(transport="stdio")