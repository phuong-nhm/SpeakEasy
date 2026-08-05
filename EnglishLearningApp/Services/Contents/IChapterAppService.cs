using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Contents
{
    public interface IChapterAppService : IApplicationService
    {
        Task<List<ChapterDto>> GetListByLevelAsync(Guid levelId);
        Task<ChapterDto> GetAsync(Guid id);
        Task<ChapterDto> CreateAsync(CreateUpdateChapterDto input);
        Task<ChapterDto> UpdateAsync(Guid id, CreateUpdateChapterDto input);
        Task DeleteAsync(Guid id);
    }
}
