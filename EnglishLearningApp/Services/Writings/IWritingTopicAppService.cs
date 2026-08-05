using System;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Writings;
using EnglishLearningApp.Entities;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Writings
{
    public interface IWritingTopicAppService : IApplicationService
    {
        Task<WritingTopicDto> GetAvailableTopicAsync(Guid chapterId, WritingTopicType topicType);
        Task<WritingTopicDto> CreateAsync(CreateUpdateWritingTopicDto input);
        Task<WritingTopicDto> UpdateAsync(Guid id, CreateUpdateWritingTopicDto input);
        Task DeleteAsync(Guid id);
    }
}
