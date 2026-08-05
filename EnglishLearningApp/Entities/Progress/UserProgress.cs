using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Progress
{
    // Trạng thái hoàn thành bài học của user
    public class UserProgress : AuditedEntity<Guid>
    {
        public Guid UserId { get; set; }
        public Guid LessonId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }

        protected UserProgress() { }

        public UserProgress(Guid id, Guid userId, Guid lessonId) : base(id)
        {
            UserId = userId;
            LessonId = lessonId;
            IsCompleted = false;
        }

        public void MarkCompleted()
        {
            IsCompleted = true;
            CompletedAt = DateTime.UtcNow;
        }
    }
}
