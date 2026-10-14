using EnglishLearningApp.Entities;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Agents
{
    public class ChatConversationDto : EntityDto<Guid>
    {
        public string ThreadId { get; set; }
        public string? Title { get; set; }
        public DateTime CreationTime { get; set; }
    }

    public class AgentChatMessageDto : EntityDto<Guid>
    {
        public ChatRole Role { get; set; }
        public string Content { get; set; }
        public DateTime CreationTime { get; set; }
    }

    public class SaveChatMessageDto
    {
        public Guid? ConversationId { get; set; } // null = tạo conversation mới
        public string ThreadId { get; set; } // bắt buộc nếu ConversationId null
        public ChatRole Role { get; set; }
        public string Content { get; set; }
    }

    public class ChatConversationDetailDto : ChatConversationDto
    {
        public List<AgentChatMessageDto> Messages { get; set; } = new();
    }
}
