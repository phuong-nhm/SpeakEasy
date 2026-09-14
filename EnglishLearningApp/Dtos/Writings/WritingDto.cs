using System;
using System.Collections.Generic;
using EnglishLearningApp.Entities;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Writings
{
    public class WritingTopicDto : EntityDto<Guid>
    {
        public Guid ChapterId { get; set; }
        public WritingTopicType TopicType { get; set; }
        public string PromptTitle { get; set; }
    }

    public class CreateUpdateWritingTopicDto
    {
        public Guid ChapterId { get; set; }
        public WritingTopicType TopicType { get; set; }
        public string PromptTitle { get; set; }
    }

    // Feedback đã parse từ JSON trả về của Gemini, thay vì trả nguyên chuỗi thô cho FE
    public class AiFeedbackDto
    {
        public bool IsCorrect { get; set; }
        public int Score { get; set; }
        public List<WritingErrorDto> Errors { get; set; }
        public string Explanation { get; set; }
        public string SuggestedCorrection { get; set; }
    }

    public class WritingErrorDto
    {
        public string ErrorType { get; set; } // ví dụ: "Grammar", "Vocabulary", "Structure"
        public string OriginalText { get; set; }
        public string Suggestion { get; set; }
    }

    // Trả về khi xem lại 1 bài đã nộp
    public class UserWritingDto : EntityDto<Guid>
    {
        public Guid TopicId { get; set; }
        public string TopicTitle { get; set; }   // thêm mới - join từ WritingTopic
        public string UserName { get; set; } 
        public string UserContent { get; set; }
        public AiFeedbackDto Feedback { get; set; }
        public DateTime CreationTime { get; set; }
    }

    // Input khi user nộp bài viết
    public class SubmitWritingDto
    {
        public Guid TopicId { get; set; }
        public string UserContent { get; set; }
    }
}
