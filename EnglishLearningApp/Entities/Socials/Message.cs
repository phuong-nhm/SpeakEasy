using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Social
{
    // Chat 1-1 đơn giản trước, không tạo bảng Conversation riêng vì chưa cần group chat
    public class Message : CreationAuditedEntity<Guid>
    {
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public string Content { get; set; }
        public bool IsRead { get; set; }

        protected Message() { }

        public Message(Guid id, Guid senderId, Guid receiverId, string content) : base(id)
        {
            SenderId = senderId;
            ReceiverId = receiverId;
            Content = content;
            IsRead = false;
        }

        public void MarkAsRead() => IsRead = true;
    }
    // "1 cuộc hội thoại" = query 2 chiều theo cặp (SenderId, ReceiverId), group by cặp Id nhỏ hơn/lớn hơn
    // CreationTime (có sẵn từ CreationAuditedEntity) dùng làm SentAt, không cần cột riêng

}
