using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Agents
{
    public class ChatConversation : CreationAuditedEntity<Guid>
    {
        public Guid UserId { get; set; }
        public string ThreadId { get; set; } // khớp thread_id bên Agent Python
        public string? Title { get; set; } // tự đặt theo câu hỏi đầu tiên

        protected ChatConversation() { }

        public ChatConversation(Guid id, Guid userId, string threadId) : base(id)
        {
            UserId = userId;
            ThreadId = threadId;
        }
    }
}
