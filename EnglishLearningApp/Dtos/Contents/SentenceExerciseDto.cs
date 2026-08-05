using System;
using System.Collections.Generic;
using EnglishLearningApp.Entities;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Contents
{
    // Trả về cho FE để xếp câu - KHÔNG chứa CorrectSentence gốc, chỉ trả list từ đã xáo trộn
    public class SentenceExerciseDto : EntityDto<Guid>
    {
        public Guid LessonId { get; set; }
        public SectionType SectionType { get; set; }
        public string AudioUrl { get; set; }
        public List<string> ShuffledWords { get; set; }
    }

    // Dùng cho Admin CMS
    public class CreateUpdateSentenceExerciseDto
    {
        public Guid LessonId { get; set; }
        public SectionType SectionType { get; set; }
        public string CorrectSentence { get; set; }
        public string AudioUrl { get; set; }
    }

    // Input khi user nộp đáp án xếp câu, BE so sánh với CorrectSentence lưu trong DB
    public class CheckSentenceAnswerDto
    {
        public Guid ExerciseId { get; set; }
        public List<string> UserOrderedWords { get; set; }
    }
}
