using EnglishLearningApp.Dtos.Agents;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.Services.Agents
{
    public interface IAgentChatAppService: IApplicationService
    {
        Task<AgentChatMessageDto> SaveMessageAsync(SaveChatMessageDto input);
        Task<List<ChatConversationDto>> GetMyConversationsAsync();
        Task<ChatConversationDetailDto> GetConversationDetailAsync(Guid conversationId);
    }
}
