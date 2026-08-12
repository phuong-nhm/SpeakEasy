using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Contents
{
    public interface ISentenceExerciseAppService : IApplicationService
    {
        Task<List<SentenceExerciseDto>> GetListByLessonAsync(Guid lessonId, SectionType? sectionType = null);
        Task<SentenceExerciseDto> GetShuffledSentenceAsync(Guid exerciseId);
        Task<bool> CheckAnswerAsync(CheckSentenceAnswerDto input);
        Task<SentenceExerciseDto> CreateAsync(CreateUpdateSentenceExerciseDto input);
        Task<SentenceExerciseDto> UpdateAsync(Guid id, CreateUpdateSentenceExerciseDto input);
        Task DeleteAsync(Guid id);
        Task<List<SentenceExerciseDto>> CreateManyAsync(List<CreateUpdateSentenceExerciseDto> inputs);
    }
}
