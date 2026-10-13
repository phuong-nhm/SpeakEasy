import os
from dotenv import load_dotenv
import sys
load_dotenv()

# Thư mục gốc english-agent (cha của thư mục app/)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MCP_SERVER_PATH = os.path.join(PROJECT_ROOT, "mcp_server.py")

# Kiểm tra nếu tồn tại thư mục venv của Windows ở local
PYTHON_EXECUTABLE = sys.executable
# Model Gemini
MODEL_NAME = os.getenv("GEMINI_MODEL_1", "gemini-3.5-flash")
TEMPERATURE = 0.2
MAX_OUTPUT_TOKENS = 1024

# CORS: tạm giữ "*" như bản cũ, sẽ siết lại khi làm checklist production
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
]