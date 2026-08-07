using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Permissions;
using Microsoft.AspNetCore.Authorization;
using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace EnglishLearningApp.AppServices.Contents
{
    public class LevelAppService :
        CrudAppService<Level, LevelDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateLevelDto>,
        ILevelAppService
    {
        public LevelAppService(IRepository<Level, Guid> repository) : base(repository)
        {
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public override Task<LevelDto> CreateAsync(CreateUpdateLevelDto input)
        {
            return base.CreateAsync(input);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public override Task DeleteAsync(Guid id)
        {
            return base.DeleteAsync(id);
        }
        [AllowAnonymous]
        public override Task<LevelDto> GetAsync(Guid id)
        {
            return base.GetAsync(id);
        }
        [AllowAnonymous]
        public override Task<PagedResultDto<LevelDto>> GetListAsync(PagedAndSortedResultRequestDto input)
        {
            return base.GetListAsync(input);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public override Task<LevelDto> UpdateAsync(Guid id, CreateUpdateLevelDto input)
        {
            return base.UpdateAsync(id, input);
        }
    }
}
