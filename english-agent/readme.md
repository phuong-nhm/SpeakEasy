run venv: venv\Scripts\activate.bat
stop venv: deactivate
run fast api: uvicorn app.main:app --reload
install libary: pipreqs . --encoding=utf-8 --force

## docstring chung của tool

"""Mô tả ngắn gọn chức năng của tool này làm gì.

    Args:
        tham_so: Mô tả ý nghĩa của tham số truyền vào.

    👉 LƯU Ý BẮT BUỘC CHO AI (CRITICAL SYSTEM INSTRUCTIONS):
    1. Các mã ID / GUID (ví dụ: level_id, chapter_id, lesson_id) bên trong dữ liệu trả về CHỈ DÙNG ĐỂ XỬ LÝ NỘI BỘ và phục vụ cho việc gọi các tool tiếp theo (Tool Chaining).
    2. TUYỆT ĐỐI KHÔNG in, hiển thị, hoặc đưa bất kỳ mã ID/GUID nào vào phần văn bản trả lời cho người dùng.
    3. Trình bày nội dung gọn gàng, sạch sẽ, chỉ hiển thị tên tiêu đề, mô tả thân thiện bằng định dạng Markdown, tuyệt đối không để lộ mã kỹ thuật hay các ký tự thừa thãi.
    """
