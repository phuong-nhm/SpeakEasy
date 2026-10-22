using EnglishLearningApp.Dtos.Progresses;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.Services.Progresses
{
    public interface IUserLessonPartProgressAppService: IApplicationService
    {
        Task<UserLessonPartProgressDto> GetByLessonAsync(Guid lessonId);
        Task MarkPartCompletedAsync(MarkPartCompletedDto input);
    }
}
