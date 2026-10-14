using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Agents
{
    public class AgentChatMessage : CreationAuditedEntity<Guid>
    {
        public Guid ConversationId { get; set; }
        public ChatRole Role { get; set; }
        public string Content { get; set; }

        protected AgentChatMessage() { }

        public AgentChatMessage(Guid id, Guid conversationId, ChatRole role, string content) : base(id)
        {
            ConversationId = conversationId;
            Role = role;
            Content = content;
        }
    }
}
