using EnglishLearningApp.Dtos.Progresses;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.Services.Progresses
{
    public interface IUserXpAppService: IApplicationService
    {
        Task RecordXpAsync(RecordXpDto input);
        Task<MyXpSummaryDto> GetMySummaryAsync();
        Task<LeaderboardResultDto> GetWeeklyLeaderboardAsync(int top = 50);
        Task<LeaderboardResultDto> GetAllTimeLeaderboardAsync(int top = 50);
        Task<LeaderboardResultDto> GetFriendsWeeklyLeaderboardAsync();
    }
}
