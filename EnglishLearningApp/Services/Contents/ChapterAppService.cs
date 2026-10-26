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
using ZiggyCreatures.Caching.Fusion;

namespace EnglishLearningApp.AppServices.Contents
{
    public class ChapterAppService : EnglishLearningAppAppService, IChapterAppService
    {
        private readonly IRepository<Chapter, Guid> _chapterRepo;
        private readonly IFusionCache _cache;

        public ChapterAppService(IRepository<Chapter, Guid> chapterRepo, IFusionCache cache)
        {
            _chapterRepo = chapterRepo;
            _cache = cache;
        }

        [AllowAnonymous]
        public async Task<List<ChapterDto>> GetListByLevelAsync(Guid levelId)
        {
            var cacheKey = $"chapter:by-level:{levelId}";
            return await _cache.GetOrSetAsync(cacheKey, async _ =>
            {
                var queryable = await _chapterRepo.GetQueryableAsync();
                var chapters = await AsyncExecuter.ToListAsync(
                    queryable.Where(x => x.LevelId == levelId).OrderBy(x => x.OrderIndex));
                return ObjectMapper.Map<List<Chapter>, List<ChapterDto>>(chapters);
            });
        }

        // GetListByLevelPagedAsync và GetAsync giữ nguyên, ít gọi, không cache

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<ChapterDto> CreateAsync(CreateUpdateChapterDto input)
        {
            var chapter = ObjectMapper.Map<CreateUpdateChapterDto, Chapter>(input);
            await _chapterRepo.InsertAsync(chapter);
            await _cache.RemoveAsync($"chapter:by-level:{chapter.LevelId}");
            return ObjectMapper.Map<Chapter, ChapterDto>(chapter);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<ChapterDto> UpdateAsync(Guid id, CreateUpdateChapterDto input)
        {
            var chapter = await _chapterRepo.GetAsync(id);
            var oldLevelId = chapter.LevelId; // phòng trường hợp Admin đổi Chapter sang Level khác
            ObjectMapper.Map(input, chapter);
            await _chapterRepo.UpdateAsync(chapter);
            await _cache.RemoveAsync($"chapter:by-level:{oldLevelId}");
            if (chapter.LevelId != oldLevelId)
            {
                await _cache.RemoveAsync($"chapter:by-level:{chapter.LevelId}");
            }
            return ObjectMapper.Map<Chapter, ChapterDto>(chapter);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            var chapter = await _chapterRepo.GetAsync(id); // lấy trước khi xóa để biết LevelId
            await _chapterRepo.DeleteAsync(id);
            await _cache.RemoveAsync($"chapter:by-level:{chapter.LevelId}");
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
    }
}
