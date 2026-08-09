using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Permissions;
using EnglishLearningApp.Services;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
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

        [AllowAnonymous]
        public async Task<List<SentenceExerciseDto>> GetListByLessonAsync(Guid lessonId, SectionType? sectionType = null)
        {
            var queryable = await _sentenceRepo.GetQueryableAsync();
            var query = queryable.Where(x => x.LessonId == lessonId);
            if (sectionType.HasValue)
            {
                query = query.Where(x => x.SectionType == sectionType.Value);
            }

            var list = await AsyncExecuter.ToListAsync(query);
            return list.Select(BuildDto).ToList();
        }

        [AllowAnonymous]
        public async Task<SentenceExerciseDto> GetShuffledSentenceAsync(Guid exerciseId)
        {
            var exercise = await _sentenceRepo.GetAsync(exerciseId);
            return BuildDto(exercise);
        }

        [Authorize]
        public async Task<bool> CheckAnswerAsync(CheckSentenceAnswerDto input)
        {
            var exercise = await _sentenceRepo.GetAsync(input.ExerciseId);

            switch (exercise.ExerciseType)
            {
                case ExerciseType.FillInBlank:
                    {
                        var words = exercise.CorrectSentence.Split(' ');
                        if (!input.BlankIndex.HasValue || input.BlankIndex.Value < 0 || input.BlankIndex.Value >= words.Length)
                        {
                            throw new UserFriendlyException(L["InvalidBlankIndex"]);
                        }

                        var correctWord = words[input.BlankIndex.Value];
                        return string.Equals(
                            input.UserAnswerText?.Trim(),
                            correctWord.Trim(),
                            StringComparison.OrdinalIgnoreCase);
                    }

                case ExerciseType.AnswerQuestion:
                    {
                        return string.Equals(
                            input.UserAnswerText?.Trim(),
                            exercise.CorrectSentence.Trim(),
                            StringComparison.OrdinalIgnoreCase);
                    }

                default: // WordOrder, TranslateFromVietnamese - đều chấm bằng ghép từ theo thứ tự
                    {
                        var userAnswer = string.Join(" ", input.UserOrderedWords ?? new List<string>());
                        return string.Equals(
                            userAnswer.Trim(),
                            exercise.CorrectSentence.Trim(),
                            StringComparison.OrdinalIgnoreCase);
                    }
            }
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<SentenceExerciseDto> CreateAsync(CreateUpdateSentenceExerciseDto input)
        {
            var exercise = ObjectMapper.Map<CreateUpdateSentenceExerciseDto, SentenceExercise>(input);
            await _sentenceRepo.InsertAsync(exercise);
            return BuildDto(exercise);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<SentenceExerciseDto> UpdateAsync(Guid id, CreateUpdateSentenceExerciseDto input)
        {
            var exercise = await _sentenceRepo.GetAsync(id);
            ObjectMapper.Map(input, exercise);
            await _sentenceRepo.UpdateAsync(exercise);
            return BuildDto(exercise);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            await _sentenceRepo.DeleteAsync(id);
        }

        // Thay cho MapWithShuffledWords cũ - giờ rẽ nhánh theo ExerciseType,
        // chỉ điền đúng field cần thiết cho từng dạng, không lộ CorrectSentence gốc
        private SentenceExerciseDto BuildDto(SentenceExercise exercise)
        {
            var dto = ObjectMapper.Map<SentenceExercise, SentenceExerciseDto>(exercise);
            var random = new Random();

            switch (exercise.ExerciseType)
            {
                case ExerciseType.FillInBlank:
                    {
                        var words = exercise.CorrectSentence.Split(' ');
                        var blankIndex = random.Next(words.Length);
                        var displayWords = (string[])words.Clone();
                        displayWords[blankIndex] = "_____";

                        dto.DisplaySentence = string.Join(" ", displayWords);
                        dto.BlankIndex = blankIndex;
                        break;
                    }

                case ExerciseType.AnswerQuestion:
                    {
                        dto.PromptText = exercise.PromptText;
                        break;
                    }

                case ExerciseType.TranslateFromVietnamese:
                    {
                        dto.VietnameseTranslation = exercise.VietnameseTranslation;
                        dto.ShuffledWords = exercise.CorrectSentence.Split(' ').OrderBy(_ => random.Next()).ToList();
                        break;
                    }

                default: // WordOrder
                    {
                        dto.ShuffledWords = exercise.CorrectSentence.Split(' ').OrderBy(_ => random.Next()).ToList();
                        break;
                    }
            }

            return dto;
        }
    }
}