using System;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Contents
{
    // Dùng khi hiển thị thông tin từ vựng bình thường (không lộ đáp án quiz)
    public class VocabularyDto : EntityDto<Guid>
    {
        public Guid LessonId { get; set; }
        public string Word { get; set; }
        public string Meaning { get; set; }
        public string ImageUrl { get; set; }
        public string AudioUrl { get; set; }
    }

    // Dùng cho Admin CMS - có đủ field kể cả Distractor
    public class CreateUpdateVocabularyDto
    {
        public Guid LessonId { get; set; }
        public string Word { get; set; }
        public string Meaning { get; set; }
        public string ImageUrl { get; set; }
        public string AudioUrl { get; set; }
        public string Distractor { get; set; }
    }

    // Dùng riêng cho màn quiz trắc nghiệm 2 lựa chọn - đã trộn sẵn vị trí đúng/sai
    public class VocabularyQuizDto
    {
        public Guid VocabularyId { get; set; }
        public string Word { get; set; }
        public string ImageUrl { get; set; }
        public string AudioUrl { get; set; }
        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string CorrectOption { get; set; } // "A" hoặc "B"
    }
}
