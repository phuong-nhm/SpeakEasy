# English Learning Agent

AI agent hỗ trợ học viên trong dự án web học tiếng Anh — dạy ngữ pháp, chấm bài, theo dõi tiến độ. Agent giao tiếp với học viên qua chat, tự gọi API của backend chính (ASP.NET/ABP) khi cần dữ liệu thật.

## Kiến trúc

Dùng LangGraph theo mô hình **supervisor pattern**:

- 1 supervisor node (dùng model rẻ hơn để tối ưu latency, vì chỉ cần phân loại intent) điều phối, route câu hỏi của học viên sang đúng sub-agent
- 3 sub-agent chuyên biệt, mỗi agent dựng bằng `create_react_agent`:
  - **tutor** — giải thích ngữ pháp, trả lời thắc mắc bài học
  - **progress** — tra cứu tiến độ học tập, lịch sử ôn tập
  - **evaluator** — chấm bài viết luận, bài nghe, kiểm tra đáp án
- State/lịch sử hội thoại lưu qua `MemorySaver` (checkpointer theo `thread_id`), giới hạn chỉ gửi 10 tin nhắn gần nhất lên model mỗi lần gọi để tránh phình context theo thời gian

## Kết nối backend qua MCP

Agent không gọi thẳng database — mọi thao tác đọc/ghi dữ liệu đều đi qua lớp MCP tools (`mcp_server.py`, chạy như 1 process riêng qua stdio), gọi sang REST API của backend ASP.NET:

Đọc dữ liệu chương trình học:

- `get_levels`, `get_chapters`, `get_lessons`, `get_lesson_content`
- `get_vocabulary_by_lesson`, `get_sentence_exercises_by_lesson`
- `get_grammar_notes_by_lesson`, `get_grammar_notes_by_chapter`
- `get_listening_passages`, `get_available_writing_topics`

Đọc dữ liệu cá nhân học viên (cần access token):

- `get_my_profile`, `get_my_progress`, `get_chapter_progress`, `get_due_reviews`
- `get_writing_history`, `get_writing_detail`

Chấm bài / ghi dữ liệu (một số tool bắt buộc tham số `confirm=True` trước khi thực thi, để tránh agent tự ý nộp bài thay học viên):

- `check_sentence_answer`, `check_matching_answer`
- `submit_listening_multiple_choice`, `submit_listening_essay`, `submit_writing`

Access token của học viên được truyền qua `RunnableConfig` (`configurable.access_token`), lấy ra trong từng tool bằng `ensure_config()`.

## Guardrail an toàn (3 lớp, theo cơ chế fail-open)

Lớp sau chỉ chạy khi cần, không phải lúc nào cũng chạy đủ cả 3, để tối ưu chi phí/latency:

1. **Regex** — chặn nhanh, miễn phí, bắt các từ khóa rõ ràng (mật khẩu, API key, system prompt, ignore instructions...)
2. **LLM classifier (model rẻ)** — chỉ kích hoạt khi câu hỏi chứa từ khóa nghi ngờ nhẹ (giả vờ, đóng vai, pretend...), hỏi model YES/NO xem có đang cố khai thác thông tin nhạy cảm không
3. **ToxicLanguage** (guardrails-ai) — kiểm tra lời lẽ độc hại, chạy song song với Lớp 2 bằng `asyncio.gather` để không cộng dồn latency

Fail-open: nếu hệ thống guardrail tự lỗi (model down, exception...) thì cho qua, chỉ chặn khi guard thật sự phát hiện vi phạm.

Output cũng được lọc: regex che các GUID/UUID nhạy cảm trước khi trả về cho học viên.

## Tech stack

- FastAPI + Uvicorn
- LangChain / LangGraph, model chính + model phụ đều qua Gemini (`langchain_google_genai`)
- `langchain-mcp-adapters` để load MCP tools vào agent
- `guardrails-ai` + `guardrails-ai-toxic-language` (local model Detoxify, không cần API key)
- `slowapi` cho rate limiting
- LangSmith cho tracing/observability

## Triển khai

CI/CD qua GitHub Actions: lint + test → build Docker image (multi-stage, torch CPU-only để giảm size) → push lên GHCR → deploy lên Azure Container Apps.

Dockerfile bake sẵn model Detoxify (`guardrails-ai-toxic-language` post_install) và NLTK punkt ngay lúc build, chạy bằng user không phải root — tránh phải tải lại model mỗi lần container cold-start.

## Biến môi trường cần có

- `GEMINI_MODEL_1`, `GEMINI_MODEL_VALIDATE` — model chính và model rẻ cho validate/routing
- `ALLOWED_ORIGINS` — domain frontend được phép gọi API (CORS)
- `BACKEND_URL` — URL của backend ASP.NET để MCP tools gọi sang

## Các câu lệnh dùng khi code

run venv: venv\Scripts\activate.bat
stop venv: deactivate
run fast api: uvicorn app.main:app --reload
install libary: pipreqs . --encoding=utf-8 --force
