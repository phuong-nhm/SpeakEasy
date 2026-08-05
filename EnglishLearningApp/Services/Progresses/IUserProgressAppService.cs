using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Progresses
{
    public interface IUserProgressAppService : IApplicationService
    {
        Task MarkLessonCompletedAsync(Guid lessonId);
        Task<double> GetProgressByChapterAsync(Guid chapterId);
    }
}
