using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Social
{
    // Lời mời kết bạn có hướng: RequesterId gửi, AddresseeId nhận
    public class Friendship : AuditedEntity<Guid>
    {
        public Guid RequesterId { get; set; }
        public Guid AddresseeId { get; set; }
        public FriendshipStatus Status { get; set; }
        public DateTime? RespondedAt { get; set; } // lúc Accept/Decline

        protected Friendship() { }

        public Friendship(Guid id, Guid requesterId, Guid addresseeId) : base(id)
        {
            RequesterId = requesterId;
            AddresseeId = addresseeId;
            Status = FriendshipStatus.Pending;
        }

        public void Accept()
        {
            Status = FriendshipStatus.Accepted;
            RespondedAt = DateTime.UtcNow;
        }

        public void Decline()
        {
            Status = FriendshipStatus.Declined;
            RespondedAt = DateTime.UtcNow;
        }
    }
    // Unique index (RequesterId, AddresseeId) để tránh gửi trùng lời mời - khai báo ở DbContext
    // Query "danh sách bạn bè" = Status=Accepted, UserId nằm ở RequesterId HOẶC AddresseeId (2 chiều)

}
