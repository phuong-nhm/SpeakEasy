using EnglishLearningApp.Entities;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Listenings
{
    public class ListeningQuestionDto : EntityDto<Guid>
    {
        public Guid PassageId { get; set; }
        public ListeningQuestionType QuestionType { get; set; }
        public string QuestionText { get; set; }
        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string OptionC { get; set; }
        public string OptionD { get; set; }
        public string CorrectOptionKey { get; set; }
        public int OrderIndex { get; set; }
    }

    // ==== Client dùng — KHÔNG có CorrectOptionKey, tránh lộ đáp án ====
    public class ListeningQuestionClientDto : EntityDto<Guid>
    {
        public ListeningQuestionType QuestionType { get; set; }
        public string QuestionText { get; set; }
        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string OptionC { get; set; }
        public string OptionD { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CreateUpdateListeningQuestionDto
    {
        public ListeningQuestionType QuestionType { get; set; }

        [Required]
        public string QuestionText { get; set; }
        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string OptionC { get; set; }
        public string OptionD { get; set; }
        public string CorrectOptionKey { get; set; } // chỉ bắt buộc khi MultipleChoice, check ở AppService
        public int OrderIndex { get; set; }
    }
}
