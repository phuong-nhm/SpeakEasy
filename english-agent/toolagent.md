# MCP Tools - Checklist theo giai đoạn

Ghi chú: các route đánh dấu (kiểm tra auth) là chưa chắc có cần đăng nhập hay không, cần test lại.

## Giai đoạn 1 - Tool đọc dữ liệu (không cần đăng nhập)

- [x] get_levels - GET /api/app/level
- [x] get_chapters - GET /api/app/chapter/by-level/{levelId}
- [x] get_lessons - GET /api/app/lesson/by-chapter/{chapterId}
- [ ] get_vocabulary_by_lesson - GET /api/app/vocabulary/by-lesson/{lessonId}
- [ ] get_sentence_exercises_by_lesson - GET /api/app/sentence-exercise/by-lesson/{lessonId}
- [ ] get_grammar_notes_by_lesson - GET /api/app/grammar-note/get-by-lesson?lessonId=...
- [ ] get_grammar_notes_by_chapter - GET /api/app/grammar-note/by-chapter/{chapterId}
- [ ] get_lesson_content - GET /api/app/lesson/lesson-content/{lessonId} (kiểm tra auth)
- [ ] get_listening_passages - GET /api/app/listening-passage/for-learner/{chapterId} (cho phép anonymous)
- [ ] get_available_writing_topics - GET /api/app/writing-topic/available-topic/{chapterId}?topicType=... (kiểm tra auth)

## Giai đoạn 2 - Tool theo từng user (cần đăng nhập)

Lưu ý trước khi làm: phải giải quyết cách truyền token của user xuống tool (không để LLM tự điền token), thread_id lấy từ userId đã xác thực ở server, và tool ghi dữ liệu nên có bước xác nhận.

### 2A. Đọc dữ liệu cá nhân

- [ ] get_my_profile - GET /api/account/my-profile
- [ ] get_my_progress - GET /api/app/user-progress/my-progress
- [ ] get_chapter_progress - GET /api/app/user-progress/progress-by-chapter/{chapterId}
- [ ] get_due_reviews - GET /api/app/user-lesson-review/due-reviews
- [ ] get_writing_history - GET /api/app/user-writing/history
- [ ] get_writing_detail - GET /api/app/user-writing/detail/{writingId}

### 2B. Chấm bài

- [ ] check_sentence_answer - POST /api/app/sentence-exercise/check-answer
- [ ] check_matching_answer - POST /api/app/matching-game/check-answer
- [ ] submit_listening_multiple_choice - POST /api/app/user-listening-answer/submit-multiple-choice
- [ ] submit_listening_essay - POST /api/app/user-listening-answer/submit-essay (gọi AI chấm, tốn token)
- [ ] submit_writing - POST /api/app/user-writing/submit-writing (gọi AI chấm, tốn token)

### 2C. Ghi dữ liệu (nên hỏi xác nhận trước khi gọi)

- [ ] mark_lesson_completed - POST /api/app/user-progress/mark-lesson-completed/{lessonId}
- [ ] init_review - POST /api/app/user-lesson-review/init-review/{lessonId}
- [ ] complete_review - POST /api/app/user-lesson-review/complete-review

## Giai đoạn 3 - Nâng cao

- [ ] System prompt cho agent (vai trò gia sư, trả lời tiếng Việt khi giải thích, từ chối câu lạc đề)
- [ ] Gợi ý ôn tập cá nhân hóa (kết hợp get_due_reviews + get_my_progress)
- [ ] Tự sinh bài luyện từ từ vựng của lesson, rồi chấm bằng check_sentence_answer
- [ ] Hỏi đáp tiếp về bài viết đã chấm (dùng get_writing_detail)
- [ ] Hiển thị trạng thái tool trên UI ("đang tra bài học...")
- [ ] Giới hạn số lượt hỏi mỗi user mỗi ngày
- [ ] Rút gọn lịch sử hội thoại (giữ N lượt gần nhất hoặc tóm tắt)
- [ ] Ghi log / tracing tool call (LangSmith hoặc log tự làm)
- [ ] Thử MCP resources và prompts (ngoài tool)
- [ ] Multi-agent kiểu Supervisor (agent tra cứu, agent chấm bài, agent admin)
- [ ] Batch API cho admin / giáo viên (sinh hàng loạt bài tập, audio, ảnh, chấm bài)

## Không đưa thành tool cho agent học viên

- Toàn bộ POST / PUT / DELETE của admin (tạo, sửa, xóa level, chapter, lesson, vocabulary, sentence-exercise, grammar-note, listening-passage, writing-topic)
- GET /api/app/admin-users/list-with-roles
- GET /api/app/user-writing/for-admin và detail-for-admin
- POST /api/app/media-upload và media-upload/many
- POST /api/app/chapter/{id}/unlock-checkpoint (cân nhắc sau)

Gợi ý thứ tự làm: xong giai đoạn 1, rồi system prompt, rồi giải quyết 3 điểm lưu ý của giai đoạn 2, rồi tool đọc theo user (2A), tới chấm bài (2B), cuối cùng là ghi dữ liệu (2C).
