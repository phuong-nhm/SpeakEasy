from mcp.server.fastmcp  import FastMCP
import requests
import os
from urllib3.exceptions import InsecureRequestWarning

BACKEND_URL = os.getenv("BACKEND_URL", "https://localhost:44326")

mcp = FastMCP("english-learning-tools")
requests.urllib3.disable_warnings(InsecureRequestWarning)
@mcp.tool()
def get_levels() -> str:
    """Lấy danh sách các Level học tiếng Anh hiện có (Level > Chapter > Lesson)."""
    response = requests.get(f"{BACKEND_URL}/api/app/level", verify=False)
    response.raise_for_status()
    return response.text  # trả JSON dạng string luôn cho đơn giản
@mcp.tool()
def get_chapters(level_id: str) -> str:
    """Lấy danh sách các Chapter theo ID của Level.
    
    Args:
        level_id: ID của Level (chuỗi GUID hoặc ID dạng số của level cần lấy chapter).
    """
    response = requests.get(f"{BACKEND_URL}/api/app/chapter/by-level/{level_id}", verify=False)
    response.raise_for_status()
    return response.text  # trả JSON dạng string luôn cho đơn giản
@mcp.tool()
def get_lessons(chapter_id: str) -> str:
    """Lấy danh sách các Lesson theo ID của Chapter.
    Args:
        chapter_id: ID của Chapter (chuỗi GUID hoặc ID dạng số của chapter cần lấy lesson).
    """
    response = requests.get(f"{BACKEND_URL}/api/app/lesson/by-chapter/{chapter_id}", verify=False)
    response.raise_for_status()
    return response.text  # trả JSON dạng string luôn cho đơn giản
if __name__ == "__main__":
    mcp.run()