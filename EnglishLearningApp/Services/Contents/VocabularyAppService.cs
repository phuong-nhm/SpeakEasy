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
    public class VocabularyAppService : EnglishLearningAppAppService, IVocabularyAppService
    {
        private const int MaxBatchSize = 200;

        private readonly IRepository<Vocabulary, Guid> _vocabRepo;
        private readonly IAudioGenerationService _audioService;
        private readonly IImageGenerationService _imageService;

        public VocabularyAppService(
            IRepository<Vocabulary, Guid> vocabRepo,
            IAudioGenerationService audioService,
            IImageGenerationService imageService)
        {
            _vocabRepo = vocabRepo;
            _audioService = audioService;
            _imageService = imageService;
        }

        [AllowAnonymous]
        public async Task<List<VocabularyDto>> GetListByLessonAsync(Guid lessonId)
        {
            var queryable = await _vocabRepo.GetQueryableAsync();
            var vocabs = await AsyncExecuter.ToListAsync(
                queryable.Where(x => x.LessonId == lessonId));
            return ObjectMapper.Map<List<Vocabulary>, List<VocabularyDto>>(vocabs);
        }

        // Trả về từng câu quiz trắc nghiệm 2 lựa chọn, đã trộn ngẫu nhiên vị trí đúng/sai
        public async Task<List<VocabularyQuizDto>> GetQuizBatchAsync(Guid lessonId)
        {
            var queryable = await _vocabRepo.GetQueryableAsync();
            var vocabs = await AsyncExecuter.ToListAsync(
                queryable.Where(x => x.LessonId == lessonId));
            var random = new Random();
            var result = new List<VocabularyQuizDto>();
            foreach (var v in vocabs)
            {
                var isCorrectFirst = random.Next(2) == 0;
                result.Add(new VocabularyQuizDto
                {
                    VocabularyId = v.Id,
                    Word = v.Word,
                    ImageUrl = v.ImageUrl,
                    AudioUrl = v.AudioUrl,
                    OptionA = isCorrectFirst ? v.Meaning : v.Distractor,
                    OptionB = isCorrectFirst ? v.Distractor : v.Meaning,
                    CorrectOption = isCorrectFirst ? "A" : "B"
                });
            }
            return result;
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<VocabularyDto> CreateAsync(CreateUpdateVocabularyDto input)
        {
            var vocab = ObjectMapper.Map<CreateUpdateVocabularyDto, Vocabulary>(input);
            await _vocabRepo.InsertAsync(vocab);
            return ObjectMapper.Map<Vocabulary, VocabularyDto>(vocab);
        }

        // Nhập hàng loạt - Admin CMS paste JSON danh sách từ vựng đã soạn sẵn.
        // Item nào chưa có AudioUrl sẽ được tự động sinh audio qua Gemini TTS trước khi lưu.
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<List<VocabularyDto>> CreateManyAsync(List<CreateUpdateVocabularyDto> inputs)
        {
            if (inputs == null || !inputs.Any())
            {
                throw new UserFriendlyException(L["ImportListCannotBeEmpty"]);
            }

            if (inputs.Count > MaxBatchSize)
            {
                throw new UserFriendlyException(L["ImportBatchTooLarge"]);
            }

            await Task.WhenAll(
                Task.WhenAll(inputs
                    .Where(x => string.IsNullOrWhiteSpace(x.AudioUrl))
                    .Select(async x => x.AudioUrl = await _audioService.GenerateAudioUrlAsync(x.Word))),
                Task.WhenAll(inputs
                    .Where(x => string.IsNullOrWhiteSpace(x.ImageUrl))
                    .Select(async x => x.ImageUrl = await _imageService.GenerateImageUrlAsync(x.Word, x.Meaning, x.WordType)))
            );

            var vocabs = inputs
                .Select(x => ObjectMapper.Map<CreateUpdateVocabularyDto, Vocabulary>(x))
                .ToList();

            await _vocabRepo.InsertManyAsync(vocabs);

            return ObjectMapper.Map<List<Vocabulary>, List<VocabularyDto>>(vocabs);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<VocabularyDto> UpdateAsync(Guid id, CreateUpdateVocabularyDto input)
        {
            var vocab = await _vocabRepo.GetAsync(id);
            ObjectMapper.Map(input, vocab);
            await _vocabRepo.UpdateAsync(vocab);
            return ObjectMapper.Map<Vocabulary, VocabularyDto>(vocab);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            await _vocabRepo.DeleteAsync(id);
        }
    }
}