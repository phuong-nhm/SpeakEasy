using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Permissions;
using EnglishLearningApp.Services;
using EnglishLearningApp.Services.Contents;
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
        private const int MaxBatchSize = 200;

        private readonly IRepository<SentenceExercise, Guid> _sentenceRepo;
        private readonly IAudioGenerationService _audioService;

        public SentenceExerciseAppService(
            IRepository<SentenceExercise, Guid> sentenceRepo,
            IAudioGenerationService audioService)
        {
            _sentenceRepo = sentenceRepo;
            _audioService = audioService;
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

                // MỚI: chấm điểm cho bước A (nghe - chọn câu) trong Dialogue
                case ExerciseType.ListenChoose:
                    {
                        return string.Equals(
                            input.UserSelectedSentence?.Trim(),
                            exercise.CorrectSentence.Trim(),
                            StringComparison.OrdinalIgnoreCase);
                    }

                default: // WordOrder, TranslateFromVietnamese
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
            ValidateInput(input); // MỚI: gom validate ra hàm riêng, dùng chung Create + CreateMany

            var exercise = ObjectMapper.Map<CreateUpdateSentenceExerciseDto, SentenceExercise>(input);
            await _sentenceRepo.InsertAsync(exercise);
            return BuildDto(exercise);
        }

        // Nhập hàng loạt - validate đủ field bắt buộc theo ExerciseType trước, rồi tự sinh audio
        // qua Gemini TTS (đọc CorrectSentence) cho item nào chưa có AudioUrl.
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<List<SentenceExerciseDto>> CreateManyAsync(List<CreateUpdateSentenceExerciseDto> inputs)
        {
            if (inputs == null || !inputs.Any())
            {
                throw new UserFriendlyException(L["ImportListCannotBeEmpty"]);
            }

            if (inputs.Count > MaxBatchSize)
            {
                throw new UserFriendlyException(L["ImportBatchTooLarge"]);
            }

            foreach (var input in inputs)
            {
                ValidateInput(input); // MỚI: dùng lại hàm chung, đã bao gồm check ListenChoose
            }

            await Task.WhenAll(inputs
                .Where(x => string.IsNullOrWhiteSpace(x.AudioUrl))
                .Select(async x => x.AudioUrl = await _audioService.GenerateAudioUrlAsync(x.CorrectSentence)));

            var exercises = inputs
                .Select(x => ObjectMapper.Map<CreateUpdateSentenceExerciseDto, SentenceExercise>(x))
                .ToList();

            await _sentenceRepo.InsertManyAsync(exercises);

            return exercises.Select(BuildDto).ToList();
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<SentenceExerciseDto> UpdateAsync(Guid id, CreateUpdateSentenceExerciseDto input)
        {
            ValidateInput(input); // MỚI

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

        // MỚI: gom validate theo ExerciseType vào 1 chỗ, Create/CreateMany/Update dùng chung
        private void ValidateInput(CreateUpdateSentenceExerciseDto input)
        {
            if (input.ExerciseType == ExerciseType.AnswerQuestion && string.IsNullOrWhiteSpace(input.PromptText))
            {
                throw new UserFriendlyException(L["PromptTextRequiredForAnswerQuestion"]);
            }

            if (input.ExerciseType == ExerciseType.TranslateFromVietnamese && string.IsNullOrWhiteSpace(input.VietnameseTranslation))
            {
                throw new UserFriendlyException(L["VietnameseTranslationRequired"]);
            }

            if (input.ExerciseType == ExerciseType.ListenChoose && string.IsNullOrWhiteSpace(input.DistractorSentence))
            {
                throw new UserFriendlyException(L["DistractorSentenceRequiredForListenChoose"]);
            }
        }

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
                        dto.DialogueGroupId = exercise.DialogueGroupId; // MỚI
                        dto.OrderInGroup = exercise.OrderInGroup;       // MỚI
                        break;
                    }

                // MỚI: bước A trong Dialogue - nghe rồi chọn đúng câu vừa nghe
                case ExerciseType.ListenChoose:
                    {
                        var options = new List<string> { exercise.CorrectSentence, exercise.DistractorSentence };
                        dto.ListenOptions = options.OrderBy(_ => random.Next()).ToList(); // xáo trộn, không lộ câu nào đúng
                        dto.DialogueGroupId = exercise.DialogueGroupId;
                        dto.OrderInGroup = exercise.OrderInGroup;
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