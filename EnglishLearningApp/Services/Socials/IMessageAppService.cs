using EnglishLearningApp.Dtos.Socials;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.Services.Socials
{
    public interface IMessageAppService: IApplicationService
    {
        Task<MessageDto> SendAsync(SendMessageDto input);
        Task<List<MessageDto>> GetConversationAsync(Guid otherUserId);
    }
}
