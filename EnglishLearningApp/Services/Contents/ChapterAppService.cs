using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Permissions;
using EnglishLearningApp.Services;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;

namespace EnglishLearningApp.AppServices.Contents
{
    public class ChapterAppService : EnglishLearningAppAppService, IChapterAppService
    {
        private readonly IRepository<Chapter, Guid> _chapterRepo;

        public ChapterAppService(IRepository<Chapter, Guid> chapterRepo)
        {
            _chapterRepo = chapterRepo;
        }
        [AllowAnonymous]
        public async Task<List<ChapterDto>> GetListByLevelAsync(Guid levelId)
        {
            var queryable = await _chapterRepo.GetQueryableAsync();
            var query = queryable
                .Where(x => x.LevelId == levelId)
                .OrderBy(x => x.OrderIndex);

            var chapters = await AsyncExecuter.ToListAsync(query);
            return ObjectMapper.Map<List<Chapter>, List<ChapterDto>>(chapters);
        }
        [AllowAnonymous]
        public async Task<PagedResultDto<ChapterDto>> GetListByLevelPagedAsync(Guid levelId, PagedAndSortedResultRequestDto input)
        {
            var queryable = await _chapterRepo.GetQueryableAsync();
            var query = queryable
                .Where(x => x.LevelId == levelId)
                .OrderBy(x => x.OrderIndex);

            var totalCount = await AsyncExecuter.CountAsync(query);

            var chapters = await AsyncExecuter.ToListAsync(
                query.Skip(input.SkipCount).Take(input.MaxResultCount)
            );

            var items = ObjectMapper.Map<List<Chapter>, List<ChapterDto>>(chapters);

            return new PagedResultDto<ChapterDto>(totalCount, items);
        }
        [AllowAnonymous]
        public async Task<ChapterDto> GetAsync(Guid id)
        {
            var chapter = await _chapterRepo.GetAsync(id);
            return ObjectMapper.Map<Chapter, ChapterDto>(chapter);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<ChapterDto> CreateAsync(CreateUpdateChapterDto input)
        {
            var chapter = ObjectMapper.Map<CreateUpdateChapterDto, Chapter>(input);
            await _chapterRepo.InsertAsync(chapter);
            return ObjectMapper.Map<Chapter, ChapterDto>(chapter);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<ChapterDto> UpdateAsync(Guid id, CreateUpdateChapterDto input)
        {
            var chapter = await _chapterRepo.GetAsync(id);
            ObjectMapper.Map(input, chapter);
            await _chapterRepo.UpdateAsync(chapter);
            return ObjectMapper.Map<Chapter, ChapterDto>(chapter);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            await _chapterRepo.DeleteAsync(id);
        }
    }
}
