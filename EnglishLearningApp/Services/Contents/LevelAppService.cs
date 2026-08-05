using System;
using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
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
    }
}
