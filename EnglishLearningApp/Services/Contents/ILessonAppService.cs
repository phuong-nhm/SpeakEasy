using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Contents
{
    public interface ILessonAppService : IApplicationService
    {
        Task<List<LessonDto>> GetListByChapterAsync(Guid chapterId);
        Task<LessonDto> GetAsync(Guid id);
        Task<LessonContentDto> GetLessonContentAsync(Guid lessonId);
        Task<LessonDto> CreateAsync(CreateUpdateLessonDto input);
        Task<LessonDto> UpdateAsync(Guid id, CreateUpdateLessonDto input);
        Task DeleteAsync(Guid id);
    }
}
