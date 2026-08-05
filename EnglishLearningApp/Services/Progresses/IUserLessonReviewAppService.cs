using System;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Progresses;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Progresses
{
    public interface IUserLessonReviewAppService : IApplicationService
    {
        Task InitReviewAsync(Guid lessonId);
        Task<DueReviewSummaryDto> GetDueReviewsAsync();
        Task CompleteReviewAsync(CompleteReviewDto input);
    }
}
