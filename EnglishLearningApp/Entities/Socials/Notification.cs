using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Social
{
    public class Notification : CreationAuditedEntity<Guid>
    {
        public Guid UserId { get; set; } // người nhận
        public NotificationType Type { get; set; }
        public string Content { get; set; } // text hiển thị, build sẵn lúc tạo (không cần template lúc đọc)
        public Guid? RelatedEntityId { get; set; } // id của Friendship/Message/Story... tùy Type, nullable vì không phải loại nào cũng cần
        public bool IsRead { get; set; }

        protected Notification() { }

        public Notification(Guid id, Guid userId, NotificationType type, string content, Guid? relatedEntityId = null) : base(id)
        {
            UserId = userId;
            Type = type;
            Content = content;
            RelatedEntityId = relatedEntityId;
            IsRead = false;
        }

        public void MarkAsRead() => IsRead = true;
    }
}
