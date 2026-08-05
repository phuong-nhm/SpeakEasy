using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Writing
{
    // Kế thừa CreationAuditedEntity: ABP tự điền CreationTime, CreatorId, không cần tự thêm cột ngày giờ
    public class UserWriting : CreationAuditedEntity<Guid>
    {
        public Guid UserId { get; set; }
        public Guid TopicId { get; set; }
        public string UserContent { get; set; }

        // Lưu nguyên JSON trả về từ Gemini: điểm số, loại lỗi, giải thích, câu sửa gợi ý
        public string AiFeedbackJson { get; set; }

        protected UserWriting() { }

        public UserWriting(Guid id, Guid userId, Guid topicId, string userContent) : base(id)
        {
            UserId = userId;
            TopicId = topicId;
            UserContent = userContent;
        }
    }
}
