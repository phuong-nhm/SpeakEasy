using EnglishLearningApp.Dtos.Storys;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.Services.Storys
{
    public interface IStoryAppService: IApplicationService
    {
        Task<StoryDetailDto> GetDetailAsync(Guid id);
        Task<List<StoryDto>> GetListByLevelAsync(Guid levelId);
        Task<PagedResultDto<StoryDto>> GetListForAdminAsync(PagedAndSortedResultRequestDto input);
        Task DeleteAsync(Guid id);
        Task<StoryDto> CreateAsync(CreateUpdateStoryDto input);
        Task<StoryDto> UpdateAsync(Guid id, CreateUpdateStoryDto input);
    }
}
