## Ghi chú kiến trúc - KHÔNG cần sửa, chỉ để nhớ

- `VocabIntroCard`, `VocabFlashcardQuiz`, `VocabMatchingGame` (Part 1 - Vocabulary)
  CHỦ ĐỘNG check đáp án ở client, không gọi API - đây là THIẾT KẾ ĐÚNG, không
  phải chỗ cần tối ưu/sửa sau. Lý do: `VocabularyDto` (word/meaning/distractor)
  backend trả về đầy đủ, không giấu gì, nên client tự so sánh là an toàn,
  không có gì để "lộ đáp án" như SentenceExercise.
- Backend có endpoint `GET /api/app/vocabulary/quiz-batch/{lessonId}` nhưng
  HIỆN TẠI KHÔNG DÙNG trong flow Lesson, vì `VocabFlashcardQuiz` tự build quiz
  A/B từ `vocabulary` (word/meaning/distractor) ở client, logic tương đương.
  Giữ hàm `lessonService.getVocabularyQuizBatch()` trong service phòng khi
  cần, nhưng không gọi trong `useLessonFlow` để tránh request thừa.
