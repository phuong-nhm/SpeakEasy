using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Story
{
    public class UserStoryProgress : AuditedEntity<Guid>
    {
        public Guid UserId { get; set; }
        public Guid StoryId { get; set; } // unique UserId+StoryId
        public StoryReadStatus Status { get; set; }
        public DateTime? ReadAt { get; set; }

        protected UserStoryProgress() { }

        public UserStoryProgress(Guid id, Guid userId, Guid storyId) : base(id)
        {
            UserId = userId;
            StoryId = storyId;
            Status = StoryReadStatus.NotStarted;
        }

        public void MarkCompleted()
        {
            Status = StoryReadStatus.Completed;
            ReadAt = DateTime.UtcNow;
        }
    }
}
