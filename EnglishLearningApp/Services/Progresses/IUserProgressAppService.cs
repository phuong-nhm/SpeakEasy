using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Volo.Abp.Application.Services;
using EnglishLearningApp.Dtos.Progresses;

namespace EnglishLearningApp.AppServices.Progresses
{
    public interface IUserProgressAppService : IApplicationService
    {
        Task MarkLessonCompletedAsync(Guid lessonId);
        Task<double> GetProgressByChapterAsync(Guid chapterId);
        Task<List<UserProgressDto>> GetMyProgressAsync();
    }
}
