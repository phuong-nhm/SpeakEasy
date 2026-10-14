using EnglishLearningApp.Dtos.Progresses;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.Services.Progresses
{
    public interface IUserStreakAppService: IApplicationService
    {
        Task RecordStudyTodayAsync();
        Task<UserStreakDto> GetMyStreakAsync();
    }
}
