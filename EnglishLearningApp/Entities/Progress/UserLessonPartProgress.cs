using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Progress
{
    public class UserLessonPartProgress : AuditedEntity<Guid>
    {
        public Guid UserId { get; set; }
        public Guid LessonId { get; set; }

        public bool IsVocabularyCompleted { get; set; }
        public bool IsGrammarCompleted { get; set; }
        public bool IsComprehensiveCompleted { get; set; }

        protected UserLessonPartProgress() { }

        public UserLessonPartProgress(Guid id, Guid userId, Guid lessonId) : base(id)
        {
            UserId = userId;
            LessonId = lessonId;
            IsVocabularyCompleted = false;
            IsGrammarCompleted = false;
            IsComprehensiveCompleted = false;
        }
    }
}
