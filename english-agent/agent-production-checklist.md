# Checklist đưa AI Agent lên production

Nguyên tắc: guardrails không thay được phân quyền. Hàng rào bảo mật thật là backend (mỗi tool gọi API bằng token của đúng user, backend tự chặn việc không được phép). Guardrails chỉ là lớp phụ chặn rác và rò rỉ.

## Luồng một request (bản hoàn chỉnh)

1. Xác thực token, lấy userId
2. Rate limit theo user
3. Input guard
4. Agent chạy (giới hạn số vòng, timeout), tool gọi backend bằng token của user
5. Output guard
6. Stream về client
7. Ghi log

## 1. Xác thực và phân quyền

- [ ] /chat và /chat/stream kiểm tra token đăng nhập
- [ ] userId lấy từ token, không tin dữ liệu client gửi lên
- [ ] thread_id tạo từ userId ở server, không nhận từ client
- [ ] Không để LLM tự điền token vào tham số tool
- [ ] Agent học viên chỉ có tool đọc và tool của chính user, không có tool admin

## 2. Guardrails

Input:

- [ ] Giới hạn độ dài câu hỏi
- [ ] Chặn lạc đề
- [ ] Chặn cố lách prompt (prompt injection, đòi lộ system prompt)
- [ ] Che thông tin cá nhân (PII)

Output:

- [ ] Không lộ system prompt
- [ ] Không lộ thông tin cá nhân
- [ ] Không lạc đề

Tool:

- [ ] Kiểm tra tham số trước khi chạy
- [ ] Tool ghi dữ liệu hỏi xác nhận trước (mark_lesson_completed, submit_writing...)

Khác:

- [ ] Coi kết quả tool và bài viết do user nộp là dữ liệu không đáng tin (có thể chứa câu lệnh giả)
- [ ] System prompt rõ vai trò và giới hạn
- [ ] Test thử validator với tiếng Việt (nhiều validator chạy tốt nhất với tiếng Anh)

## 3. Giới hạn và chi phí

- [ ] Rate limit theo user mỗi phút và mỗi ngày
- [ ] Giới hạn max_output_tokens
- [ ] Giới hạn số vòng gọi tool (recursion_limit)
- [ ] Timeout cho LLM và cho tool
- [ ] Cắt bớt lịch sử hội thoại (giữ N lượt gần nhất hoặc tóm tắt)
- [ ] Báo lỗi dễ hiểu khi hết quota (429), không để màn hình treo

## 4. Độ tin cậy

- [ ] Tool lỗi hoặc backend sập thì trả câu thông báo gọn, không văng traceback ra UI
- [ ] Endpoint health check
- [ ] Phát hiện MCP subprocess chết và khởi động lại
- [ ] Xử lý MemorySaver: nằm trong RAM, mất khi restart, phình dần, mỗi worker một bản riêng. Dọn theo thời gian hoặc chuyển sang checkpointer lưu DB nếu chạy nhiều instance

## 5. Quan sát

- [ ] Log có cấu trúc: requestId, userId, tool đã gọi, thời gian, số token
- [ ] Không log token, mật khẩu, nội dung nhạy cảm
- [ ] Tracing (LangSmith hoặc tương tự) để xem agent làm gì

## 6. Test

- [ ] Bộ khoảng 20 đến 30 câu hỏi mẫu kèm tool kỳ vọng, chạy lại mỗi lần đổi model hoặc prompt
- [ ] Vài câu tấn công thử guardrails (lạc đề, đòi lộ prompt, chèn lệnh)

## 7. Deploy và bí mật

- [ ] API key, URL để trong biến môi trường, không để trong code
- [ ] Bỏ verify=False, dùng HTTPS thật
- [ ] CORS chỉ cho domain frontend (bỏ "\*", đặc biệt khi có allow_credentials=True)
- [ ] Chạy không có --reload
- [ ] Đóng gói Docker
- [ ] Service agent không mở thẳng cho cả internet nếu không cần

## 8. Quyền riêng tư

- [ ] Chỉ gửi cho LLM phần dữ liệu cần thiết
- [ ] Kiểm tra điều khoản dùng dữ liệu của Google (free tier có thể dùng dữ liệu để cải thiện sản phẩm) trước khi cho người dùng thật dùng
- [ ] Ghi chú trên UI rằng đây là AI và có thể sai

## Cấu trúc thư mục gợi ý

```
agent-service/
  app/main.py            FastAPI, lifespan
  app/config.py          đọc biến môi trường
  app/auth.py            kiểm tra token
  app/guardrails/        input, output
  app/agents/            tạo agent, prompt
  app/routes/            chat
  mcp_server.py
  tests/                 bộ câu hỏi mẫu
  .env.example
  Dockerfile
```

## Những chỗ code hiện tại chưa đạt

- Chưa có xác thực ở /chat
- thread_id do client gửi
- CORS đang để "\*" kèm allow_credentials=True
- verify=False trong mcp_server.py
- MemorySaver trong RAM
- Chưa có giới hạn lượt hỏi, số vòng, timeout

## Để dành sau (chưa cần ngay)

- Multi-agent (Supervisor)
- Batch API cho admin / giáo viên
- RAG
- Đánh giá bằng LLM làm giám khảo

## Thứ tự làm đề xuất

1. Xác thực và thread_id
2. Input guard
3. Giới hạn và timeout
4. Xử lý lỗi
5. Log
6. Deploy
