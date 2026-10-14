using EnglishLearningApp.Dtos.Socials;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.Services.Socials
{
    public interface IFriendshipAppService: IApplicationService
    {
        Task<FriendshipDto> SendRequestAsync(Guid addresseeId);
        Task AcceptAsync(Guid friendshipId);
        Task DeclineAsync(Guid friendshipId);
        Task<List<FriendDto>> GetMyFriendsAsync();
        Task<List<FriendDto>> GetPendingRequestsAsync();
    }
}
