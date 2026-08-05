using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Services;
using Volo.Abp.Domain.Repositories;

namespace EnglishLearningApp.AppServices.Contents
{
    public class SentenceExerciseAppService : EnglishLearningAppAppService, ISentenceExerciseAppService
    {
        private readonly IRepository<SentenceExercise, Guid> _sentenceRepo;

        public SentenceExerciseAppService(IRepository<SentenceExercise, Guid> sentenceRepo)
        {
            _sentenceRepo = sentenceRepo;
        }

        public async Task<List<SentenceExerciseDto>> GetListByLessonAsync(Guid lessonId, SectionType? sectionType = null)
        {
            var queryable = await _sentenceRepo.GetQueryableAsync();
            var query = queryable.Where(x => x.LessonId == lessonId);
            if (sectionType.HasValue)
            {
                query = query.Where(x => x.SectionType == sectionType.Value);
            }

            var list = await AsyncExecuter.ToListAsync(query);
            return list.Select(MapWithShuffledWords).ToList();
        }

        public async Task<SentenceExerciseDto> GetShuffledSentenceAsync(Guid exerciseId)
        {
            var exercise = await _sentenceRepo.GetAsync(exerciseId);
            return MapWithShuffledWords(exercise);
        }

        public async Task<bool> CheckAnswerAsync(CheckSentenceAnswerDto input)
        {
            var exercise = await _sentenceRepo.GetAsync(input.ExerciseId);
            var userAnswer = string.Join(" ", input.UserOrderedWords);
            return string.Equals(
                userAnswer.Trim(),
                exercise.CorrectSentence.Trim(),
                StringComparison.OrdinalIgnoreCase);
        }

        public async Task<SentenceExerciseDto> CreateAsync(CreateUpdateSentenceExerciseDto input)
        {
            var exercise = ObjectMapper.Map<CreateUpdateSentenceExerciseDto, SentenceExercise>(input);
            await _sentenceRepo.InsertAsync(exercise);
            return MapWithShuffledWords(exercise);
        }

        public async Task<SentenceExerciseDto> UpdateAsync(Guid id, CreateUpdateSentenceExerciseDto input)
        {
            var exercise = await _sentenceRepo.GetAsync(id);
            ObjectMapper.Map(input, exercise);
            await _sentenceRepo.UpdateAsync(exercise);
            return MapWithShuffledWords(exercise);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _sentenceRepo.DeleteAsync(id);
        }

        private SentenceExerciseDto MapWithShuffledWords(SentenceExercise exercise)
        {
            var dto = ObjectMapper.Map<SentenceExercise, SentenceExerciseDto>(exercise);
            var words = exercise.CorrectSentence.Split(' ').ToList();

            var random = new Random();
            dto.ShuffledWords = words.OrderBy(_ => random.Next()).ToList();
            return dto;
        }
    }
}
