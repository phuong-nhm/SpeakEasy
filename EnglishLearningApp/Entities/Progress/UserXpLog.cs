using NUglify;
using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Progress
{

        public class UserXpLog : CreationAuditedEntity<Guid>
        {
            public Guid UserId { get; set; }
            public int Amount { get; set; }
            public XpSource Source { get; set; }
            public Guid? RelatedEntityId { get; set; } // LessonId/CheckpointId..., nullable

            protected UserXpLog() { }

            public UserXpLog(Guid id, Guid userId, int amount, XpSource source, Guid? relatedEntityId = null) : base(id)
            {
                UserId = userId;
                Amount = amount;
                Source = source;
                RelatedEntityId = relatedEntityId;
            }
        }
  
}
