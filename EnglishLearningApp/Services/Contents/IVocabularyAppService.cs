using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Contents
{
    public interface IVocabularyAppService : IApplicationService
    {
        Task<List<VocabularyDto>> GetListByLessonAsync(Guid lessonId);
        Task<List<VocabularyQuizDto>> GetQuizBatchAsync(Guid lessonId);
        Task<VocabularyDto> CreateAsync(CreateUpdateVocabularyDto input);
        Task<VocabularyDto> UpdateAsync(Guid id, CreateUpdateVocabularyDto input);
        Task DeleteAsync(Guid id);
        Task<List<VocabularyDto>> CreateManyAsync(List<CreateUpdateVocabularyDto> inputs);
    }
}
