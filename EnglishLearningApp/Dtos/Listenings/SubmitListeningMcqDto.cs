using EnglishLearningApp.Dtos.Writings;
using System.ComponentModel.DataAnnotations;

namespace EnglishLearningApp.Dtos.Listenings
{
    public class SubmitListeningMcqDto
    {
        public Guid QuestionId { get; set; }

        [Required]
        public string SelectedOptionKey { get; set; } // "A"/"B"/"C"/"D"
    }

    public class ListeningMcqResultDto
    {
        public bool IsCorrect { get; set; }
        public string CorrectOptionKey { get; set; } // trả về sau khi đã nộp, để FE hiện đáp án đúng
    }

    public class SubmitListeningEssayDto
    {
        public Guid QuestionId { get; set; }

        [Required]
        public string UserContent { get; set; }
    }

    // Response tái sử dụng đúng AiFeedbackDto đang dùng cho UserWriting
    public class ListeningEssayResultDto
    {
        public AiFeedbackDto AiFeedback { get; set; }
    }
}
