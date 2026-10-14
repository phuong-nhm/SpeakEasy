using EnglishLearningApp.Dtos.Storys;
using EnglishLearningApp.Entities.Story;
using EnglishLearningApp.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;

namespace EnglishLearningApp.Services.Storys
{
    public class StoryAppService : EnglishLearningAppAppService, IStoryAppService
    {
        private readonly IRepository<Story, Guid> _storyRepo;
        private readonly IRepository<StorySegment, Guid> _segmentRepo;
        private readonly IRepository<StoryVocabulary, Guid> _storyVocabRepo;

        public StoryAppService(
            IRepository<Story, Guid> storyRepo,
            IRepository<StorySegment, Guid> segmentRepo,
            IRepository<StoryVocabulary, Guid> storyVocabRepo)
        {
            _storyRepo = storyRepo;
            _segmentRepo = segmentRepo;
            _storyVocabRepo = storyVocabRepo;
        }

        // Client: đọc chi tiết 1 truyện kèm Segment + từ vựng dùng để highlight
        public async Task<StoryDetailDto> GetDetailAsync(Guid id)
        {
            var story = await _storyRepo.GetAsync(id);

            var segmentQueryable = await _segmentRepo.GetQueryableAsync();
            var segments = await AsyncExecuter.ToListAsync(
                segmentQueryable.Where(x => x.StoryId == id).OrderBy(x => x.OrderIndex));

            var vocabQueryable = await _storyVocabRepo.GetQueryableAsync();
            var vocabIds = await AsyncExecuter.ToListAsync(
                vocabQueryable.Where(x => x.StoryId == id).Select(x => x.VocabularyId));

            var dto = ObjectMapper.Map<Story, StoryDetailDto>(story);
            dto.Segments = ObjectMapper.Map<List<StorySegment>, List<StorySegmentDto>>(segments);
            dto.VocabularyIds = vocabIds;
            return dto;
        }

        // Client: danh sách truyện theo Level (lọc HasImages/Genre tùy query FE truyền thêm sau)
        public async Task<List<StoryDto>> GetListByLevelAsync(Guid levelId)
        {
            var queryable = await _storyRepo.GetQueryableAsync();
            var stories = await AsyncExecuter.ToListAsync(queryable.Where(x => x.LevelId == levelId));
            return ObjectMapper.Map<List<Story>, List<StoryDto>>(stories);
        }

        // CMS Admin: xem lại danh sách truyện AI đã sinh, phân trang chuẩn ABP
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Default)]
        public async Task<PagedResultDto<StoryDto>> GetListForAdminAsync(PagedAndSortedResultRequestDto input)
        {
            var queryable = await _storyRepo.GetQueryableAsync();
            var totalCount = await AsyncExecuter.CountAsync(queryable);
            var stories = await AsyncExecuter.ToListAsync(
                queryable.OrderByDescending(x => x.Id).Skip(input.SkipCount).Take(input.MaxResultCount));

            return new PagedResultDto<StoryDto>(totalCount, ObjectMapper.Map<List<Story>, List<StoryDto>>(stories));
        }

        // CMS Admin: xóa truyện lỗi/chất lượng kém - Segment/StoryVocabulary xóa kèm thủ công vì không set Cascade ở DbContext
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            var segmentQueryable = await _segmentRepo.GetQueryableAsync();
            var segmentIds = await AsyncExecuter.ToListAsync(
                segmentQueryable.Where(x => x.StoryId == id).Select(x => x.Id));
            await _segmentRepo.DeleteManyAsync(segmentIds);

            var vocabQueryable = await _storyVocabRepo.GetQueryableAsync();
            var storyVocabIds = await AsyncExecuter.ToListAsync(
                vocabQueryable.Where(x => x.StoryId == id).Select(x => x.Id));
            await _storyVocabRepo.DeleteManyAsync(storyVocabIds);

            await _storyRepo.DeleteAsync(id);
        }
    }
}
