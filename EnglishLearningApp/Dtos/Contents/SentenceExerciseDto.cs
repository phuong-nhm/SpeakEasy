using System;
using System.Collections.Generic;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Contents
{
    // Trả về cho FE - KHÔNG bao giờ chứa CorrectSentence gốc.
    // Field nào dùng cho dạng nào thì mới có giá trị, còn lại để null - FE dựa vào
    // ExerciseType để biết đọc field nào, render UI tương ứng.
    public class SentenceExerciseDto : EntityDto<Guid>
    {
        public Guid LessonId { get; set; }
        public SectionType SectionType { get; set; }
        public string AudioUrl { get; set; }
        public ExerciseType ExerciseType { get; set; }

        // Dùng cho WordOrder và TranslateFromVietnamese - danh sách từ đã xáo trộn
        public List<string> ShuffledWords { get; set; }

        // Dùng cho FillInBlank - câu đầy đủ, từ bị khuyết đã thay bằng "_____"
        public string DisplaySentence { get; set; }
        // Vị trí (0-based) của từ bị khuyết trong câu gốc - CẦN gửi lại khi CheckAnswer,
        // không lộ đáp án vì chỉ là vị trí, không phải nội dung từ
        public int? BlankIndex { get; set; }

        // Dùng cho AnswerQuestion - câu hỏi để user trả lời
        public string PromptText { get; set; }

        // Dùng cho TranslateFromVietnamese - câu tiếng Việt gợi ý, hiển thị kèm ShuffledWords
        public string VietnameseTranslation { get; set; }
    }

    // Dùng cho Admin CMS
    public class CreateUpdateSentenceExerciseDto
    {
        public Guid LessonId { get; set; }
        public SectionType SectionType { get; set; }
        public string CorrectSentence { get; set; }
        public string AudioUrl { get; set; }
        public ExerciseType ExerciseType { get; set; } = ExerciseType.WordOrder;

        // Chỉ cần điền khi ExerciseType = AnswerQuestion
        public string PromptText { get; set; }

        // Chỉ cần điền khi ExerciseType = TranslateFromVietnamese
        public string VietnameseTranslation { get; set; }
    }

    // Input khi user nộp đáp án - field nào dùng tuỳ ExerciseType của bài đó
    public class CheckSentenceAnswerDto
    {
        public Guid ExerciseId { get; set; }

        // WordOrder, TranslateFromVietnamese - user ghép từ theo thứ tự đã chọn
        public List<string> UserOrderedWords { get; set; }

        // AnswerQuestion (câu trả lời tự do) hoặc FillInBlank (1 từ điền vào chỗ trống)
        public string UserAnswerText { get; set; }

        // Chỉ cần cho FillInBlank - lấy đúng giá trị BlankIndex server đã trả lúc lấy câu hỏi
        public int? BlankIndex { get; set; }
    }
}