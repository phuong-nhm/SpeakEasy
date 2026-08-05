using System;
using System.Linq;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Writings;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Writing;
using EnglishLearningApp.Services;
using Volo.Abp;
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

        public async Task<WritingTopicDto> CreateAsync(CreateUpdateWritingTopicDto input)
        {
            var topic = ObjectMapper.Map<CreateUpdateWritingTopicDto, WritingTopic>(input);
            await _topicRepo.InsertAsync(topic);
            return ObjectMapper.Map<WritingTopic, WritingTopicDto>(topic);
        }

        public async Task<WritingTopicDto> UpdateAsync(Guid id, CreateUpdateWritingTopicDto input)
        {
            var topic = await _topicRepo.GetAsync(id);
            ObjectMapper.Map(input, topic);
            await _topicRepo.UpdateAsync(topic);
            return ObjectMapper.Map<WritingTopic, WritingTopicDto>(topic);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _topicRepo.DeleteAsync(id);
        }
    }
}
