using EnglishLearningApp.Dtos.Storys;
using EnglishLearningApp.Entities.Story;
using EnglishLearningApp.Permissions;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
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
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<StoryDto> CreateAsync(CreateUpdateStoryDto input)
        {
            if (input.Segments == null || !input.Segments.Any())
            {
                throw new UserFriendlyException(L["StoryMustHaveAtLeastOneSegment"]);
            }

            var story = new Story(
                GuidGenerator.Create(), input.LevelId, input.Title, input.Genre,
                input.Length, input.HasImages, input.GenerationSource, input.CreatedForUserId);
            await _storyRepo.InsertAsync(story);

            var segments = input.Segments
                .Select(s => new StorySegment(GuidGenerator.Create(), story.Id, s.OrderIndex, s.Content, s.ImageUrl))
                .ToList();
            await _segmentRepo.InsertManyAsync(segments);

            if (input.VocabularyIds != null && input.VocabularyIds.Any())
            {
                var storyVocabs = input.VocabularyIds.Distinct()
                    .Select(vocabId => new StoryVocabulary(GuidGenerator.Create(), story.Id, vocabId))
                    .ToList();
                await _storyVocabRepo.InsertManyAsync(storyVocabs);
            }

            return ObjectMapper.Map<Story, StoryDto>(story);
        }

        // Sửa truyện - thay toàn bộ Segments + StoryVocabulary bằng bộ mới, không sửa CreatedForUserId/GenerationSource
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<StoryDto> UpdateAsync(Guid id, CreateUpdateStoryDto input)
        {
            if (input.Segments == null || !input.Segments.Any())
            {
                throw new UserFriendlyException(L["StoryMustHaveAtLeastOneSegment"]);
            }

            var story = await _storyRepo.GetAsync(id);
            story.LevelId = input.LevelId;
            story.Title = input.Title;
            story.Genre = input.Genre;
            story.Length = input.Length;
            story.HasImages = input.HasImages;
            await _storyRepo.UpdateAsync(story);

            var segmentQueryable = await _segmentRepo.GetQueryableAsync();
            var oldSegmentIds = await AsyncExecuter.ToListAsync(
                segmentQueryable.Where(x => x.StoryId == id).Select(x => x.Id));
            await _segmentRepo.DeleteManyAsync(oldSegmentIds);

            var newSegments = input.Segments
                .Select(s => new StorySegment(GuidGenerator.Create(), story.Id, s.OrderIndex, s.Content, s.ImageUrl))
                .ToList();
            await _segmentRepo.InsertManyAsync(newSegments);

            var vocabQueryable = await _storyVocabRepo.GetQueryableAsync();
            var oldStoryVocabIds = await AsyncExecuter.ToListAsync(
                vocabQueryable.Where(x => x.StoryId == id).Select(x => x.Id));
            await _storyVocabRepo.DeleteManyAsync(oldStoryVocabIds);

            if (input.VocabularyIds != null && input.VocabularyIds.Any())
            {
                var newStoryVocabs = input.VocabularyIds.Distinct()
                    .Select(vocabId => new StoryVocabulary(GuidGenerator.Create(), story.Id, vocabId))
                    .ToList();
                await _storyVocabRepo.InsertManyAsync(newStoryVocabs);
            }

            return ObjectMapper.Map<Story, StoryDto>(story);
        }
    }
}
