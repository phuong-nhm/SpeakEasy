using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Permissions;
using Microsoft.AspNetCore.Authorization;
using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using ZiggyCreatures.Caching.Fusion;

namespace EnglishLearningApp.AppServices.Contents
{
    public class LevelAppService :
        CrudAppService<Level, LevelDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateLevelDto>,
        ILevelAppService
    {
        private readonly IFusionCache _cache;
        private const string LevelCacheTag = "level";

        public LevelAppService(IRepository<Level, Guid> repository, IFusionCache cache) : base(repository)
        {
            _cache = cache;
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public override async Task<LevelDto> CreateAsync(CreateUpdateLevelDto input)
        {
            var result = await base.CreateAsync(input);
            await _cache.RemoveByTagAsync(LevelCacheTag);
            return result;
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public override async Task DeleteAsync(Guid id)
        {
            await base.DeleteAsync(id);
            await _cache.RemoveByTagAsync(LevelCacheTag);
        }

        [AllowAnonymous]
        public override async Task<PagedResultDto<LevelDto>> GetListAsync(PagedAndSortedResultRequestDto input)
        {
            var cacheKey = $"level:all:{input.SkipCount}:{input.MaxResultCount}:{input.Sorting}";
            return await _cache.GetOrSetAsync(
                cacheKey,
                async _ => await base.GetListAsync(input),
                tags: new[] { LevelCacheTag }
            );
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public override async Task<LevelDto> UpdateAsync(Guid id, CreateUpdateLevelDto input)
        {
            var result = await base.UpdateAsync(id, input);
            await _cache.RemoveByTagAsync(LevelCacheTag);
            return result;
        }
    }
}
