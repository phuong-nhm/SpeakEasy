using System;
using EnglishLearningApp.Dtos.Contents;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Contents
{
    // Level chỉ có 5 thao tác CRUD cơ bản -> dùng CrudAppService cho gọn
    public interface ILevelAppService :
        ICrudAppService<LevelDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateLevelDto>
    {
    }
}
