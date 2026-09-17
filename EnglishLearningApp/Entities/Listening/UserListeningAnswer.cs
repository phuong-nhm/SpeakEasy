using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Listening
{
    public class UserListeningAnswer : CreationAuditedEntity<Guid>
    {
        public Guid UserId { get; set; }
        public Guid QuestionId { get; set; } // FK -> ListeningQuestion

        // Dùng khi MultipleChoice
        public string SelectedOptionKey { get; set; } // "A"/"B"/"C"/"D"
        public bool? IsCorrect { get; set; }

        // Dùng khi Essay — chấm bằng AI Grading Agent giống UserWriting
        public string UserContent { get; set; }
        public string AiFeedbackJson { get; set; }

        protected UserListeningAnswer() { }

        public UserListeningAnswer(Guid id, Guid userId, Guid questionId) : base(id)
        {
            UserId = userId;
            QuestionId = questionId;
        }
    }
}
