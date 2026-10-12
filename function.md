# EnglishLearningApp Backend API - Quick Function Map

## Core Content (Level/Chapter/Lesson)

- `GET /api/app/level` : Lấy danh sách level.
- `POST /api/app/level` : Tạo level.
- `PUT /api/app/level/{id}` : Sửa level.
- `DELETE /api/app/level/{id}` : Xóa level.

- `GET /api/app/chapter/by-level/{levelId}` : Lấy chapter theo level.
- `POST /api/app/chapter` : Tạo chapter.
- `PUT /api/app/chapter/{id}` : Sửa chapter.
- `DELETE /api/app/chapter/{id}` : Xóa chapter.
- `POST /api/app/chapter/{id}/unlock-checkpoint` : Mở khóa checkpoint chapter.

- `GET /api/app/lesson/by-chapter/{chapterId}` : Lấy lesson theo chapter.
- `GET /api/app/lesson/lesson-content/{lessonId}` : Lấy full nội dung lesson cho learner.
- `POST /api/app/lesson` : Tạo lesson.
- `PUT /api/app/lesson/{id}` : Sửa lesson.
- `DELETE /api/app/lesson/{id}` : Xóa lesson.

## Vocabulary / Sentence / Grammar / Matching

- `GET /api/app/vocabulary/by-lesson/{lessonId}` : Lấy từ vựng theo lesson.
- `GET /api/app/vocabulary/quiz-batch/{lessonId}` : Lấy batch câu hỏi từ vựng.
- `POST /api/app/vocabulary` : Tạo từ vựng.
- `PUT /api/app/vocabulary/{id}` : Sửa từ vựng.
- `DELETE /api/app/vocabulary/{id}` : Xóa từ vựng.
- `POST /api/app/vocabulary/many` : Import nhiều từ vựng.

- `GET /api/app/sentence-exercise/by-lesson/{lessonId}` : Lấy bài tập câu theo lesson.
- `GET /api/app/sentence-exercise/for-dialogue/{chapterId}` : Lấy bài tập dialogue theo chapter.
- `GET /api/app/sentence-exercise/for-checkpoint/{chapterId}?count=...` : Lấy bộ câu hỏi checkpoint.
- `POST /api/app/sentence-exercise/check-answer` : Chấm câu trả lời bài tập câu.
- `POST /api/app/sentence-exercise` : Tạo 1 sentence exercise.
- `PUT /api/app/sentence-exercise/{id}` : Sửa sentence exercise.
- `DELETE /api/app/sentence-exercise/{id}` : Xóa sentence exercise.
- `POST /api/app/sentence-exercise/many` : Import nhiều sentence exercises.

- `GET /api/app/grammar-note/get-by-lesson?lessonId=...` : Lấy grammar note theo lesson.
- `GET /api/app/grammar-note/by-chapter/{chapterId}` : Lấy grammar notes theo chapter.
- `GET /api/app/grammar-note/by-level-paged/{levelId}` : Lấy grammar notes phân trang theo level.
- `POST /api/app/grammar-note` : Tạo grammar note.
- `PUT /api/app/grammar-note/{id}` : Sửa grammar note.
- `DELETE /api/app/grammar-note/{id}` : Xóa grammar note.
- `POST /api/app/grammar-note/many` : Import nhiều grammar notes.

- `GET /api/app/matching-game/game-for-lesson/{lessonId}` : Lấy game nối từ theo lesson.
- `GET /api/app/matching-game/game-for-summary/{lessonId}` : Lấy game nối từ dạng ôn tập.
- `GET /api/app/matching-game/game-for-chapter/{chapterId}` : Lấy game nối từ theo chapter.
- `POST /api/app/matching-game/check-answer` : Chấm đáp án game nối từ.

## Listening

- `GET /api/app/listening-passage/by-level/{levelId}` : Lấy bài nghe theo level (admin).
- `GET /api/app/listening-passage/by-chapter/{chapterId}` : Lấy bài nghe theo chapter.
- `GET /api/app/listening-passage/for-learner/{chapterId}` : Lấy bài nghe cho learner (anonymous allowed).
- `POST /api/app/listening-passage` : Tạo bài nghe.
- `PUT /api/app/listening-passage/{id}` : Sửa bài nghe.
- `DELETE /api/app/listening-passage/{id}` : Xóa bài nghe.

- `POST /api/app/user-listening-answer/submit-multiple-choice` : Chấm câu nghe trắc nghiệm.
- `POST /api/app/user-listening-answer/submit-essay` : Chấm câu nghe tự luận (AI feedback).

## Writing

- `GET /api/app/writing-topic/available-topic/{chapterId}?topicType=...` : Lấy đề writing khả dụng.
- `GET /api/app/writing-topic/by-level/{levelId}` : Lấy danh sách đề writing theo level.
- `POST /api/app/writing-topic` : Tạo đề writing.
- `PUT /api/app/writing-topic/{id}` : Sửa đề writing.
- `DELETE /api/app/writing-topic/{id}` : Xóa đề writing.

- `POST /api/app/user-writing/submit-writing` : Học viên nộp bài writing + chấm.
- `GET /api/app/user-writing/history` : Lịch sử bài nộp của user.
- `GET /api/app/user-writing/detail/{writingId}` : Chi tiết 1 bài nộp.
- `GET /api/app/user-writing/for-admin` : Danh sách bài nộp cho admin.
- `GET /api/app/user-writing/detail-for-admin/{writingId}` : Chi tiết bài nộp cho admin.
- `DELETE /api/app/user-writing/{writingId}` : Admin xóa bài nộp.

## Progress / Review

- `POST /api/app/user-progress/mark-lesson-completed/{lessonId}` : Đánh dấu hoàn thành lesson.
- `GET /api/app/user-progress/progress-by-chapter/{chapterId}` : Lấy % tiến độ theo chapter.
- `GET /api/app/user-progress/my-progress` : Lấy tiến độ toàn bộ của user.

- `POST /api/app/user-lesson-review/init-review/{lessonId}` : Khởi tạo dữ liệu ôn tập sau bài học.
- `GET /api/app/user-lesson-review/due-reviews` : Lấy danh sách item đến hạn ôn.
- `POST /api/app/user-lesson-review/complete-review` : Ghi nhận hoàn tất ôn tập.

## Admin/User & Media

- `GET /api/app/admin-users/list-with-roles` : Lấy danh sách user kèm role cho trang admin users.

- `POST /api/app/media-upload?type=image|audio` : Upload 1 file ảnh/audio, trả về URL.
- `POST /api/app/media-upload/many?type=image|audio` : Upload nhiều file ảnh/audio, trả URL theo từng file.

---

Note: Danh sách trên tập trung vào custom APIs của dự án đang được frontend gọi trực tiếp để chạy tính năng.
