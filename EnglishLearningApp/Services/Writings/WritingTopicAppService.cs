using EnglishLearningApp.Dtos.Writings;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Entities.Writing;
using EnglishLearningApp.Permissions;
using EnglishLearningApp.Services;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;

namespace EnglishLearningApp.AppServices.Writings
{
    public class WritingTopicAppService : EnglishLearningAppAppService, IWritingTopicAppService
    {
        private readonly IRepository<WritingTopic, Guid> _topicRepo;

        public WritingTopicAppService(IRepository<WritingTopic, Guid> topicRepo)
        {
            _topicRepo = topicRepo;
        }
        [AllowAnonymous]

        public async Task<WritingTopicDto> GetAvailableTopicAsync(Guid chapterId, WritingTopicType topicType)
        {
            var queryable = await _topicRepo.GetQueryableAsync();
            var query = queryable.Where(x => x.ChapterId == chapterId && x.TopicType == topicType);

            var topic = await AsyncExecuter.FirstOrDefaultAsync(query);

            if (topic == null)
            {
                throw new UserFriendlyException(L["TopicNotAvailable"]);
            }

            return ObjectMapper.Map<WritingTopic, WritingTopicDto>(topic);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]

        public async Task<WritingTopicDto> CreateAsync(CreateUpdateWritingTopicDto input)
        {
            var topic = ObjectMapper.Map<CreateUpdateWritingTopicDto, WritingTopic>(input);
            await _topicRepo.InsertAsync(topic);
            return ObjectMapper.Map<WritingTopic, WritingTopicDto>(topic);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<WritingTopicDto> UpdateAsync(Guid id, CreateUpdateWritingTopicDto input)
        {
            var topic = await _topicRepo.GetAsync(id);
            ObjectMapper.Map(input, topic);
            await _topicRepo.UpdateAsync(topic);
            return ObjectMapper.Map<WritingTopic, WritingTopicDto>(topic);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            await _topicRepo.DeleteAsync(id);
        }
        [AllowAnonymous]
        public async Task<PagedResultDto<WritingTopicDto>> GetListByLevelAsync(
    Guid levelId,
    PagedAndSortedResultRequestDto input)
        {
            var chapterRepo = LazyServiceProvider.LazyGetRequiredService<IRepository<Chapter, Guid>>();

            var chapterQueryable = await chapterRepo.GetQueryableAsync();
            var chapterIds = await AsyncExecuter.ToListAsync(
                chapterQueryable
                    .Where(x => x.LevelId == levelId)
                    .Select(x => x.Id));

            if (!chapterIds.Any())
            {
                return new PagedResultDto<WritingTopicDto>(0, new List<WritingTopicDto>());
            }

            var topicQueryable = await _topicRepo.GetQueryableAsync();
            var filteredQuery = topicQueryable
                .Where(x => chapterIds.Contains(x.ChapterId))
                .OrderBy(x => x.ChapterId)
                .ThenBy(x => x.TopicType);

            var totalCount = await AsyncExecuter.CountAsync(filteredQuery);
            var items = await AsyncExecuter.ToListAsync(
                filteredQuery.Skip(input.SkipCount).Take(input.MaxResultCount));

            var itemDtos = ObjectMapper.Map<List<WritingTopic>, List<WritingTopicDto>>(items);

            return new PagedResultDto<WritingTopicDto>(totalCount, itemDtos);
        }
    }
}
