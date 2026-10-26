using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Infrastructure;
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
using ZiggyCreatures.Caching.Fusion;

namespace EnglishLearningApp.AppServices.Contents
{
    public class VocabularyAppService : EnglishLearningAppAppService, IVocabularyAppService
    {
        private const int MaxBatchSize = 200;

        private readonly IRepository<Vocabulary, Guid> _vocabRepo;
        private readonly IAudioGenerationService _audioService;
        private readonly IImageGenerationService _imageService;
        private const int MaxConcurrentGeneration = 5;
        private readonly IFusionCache _cache;
        public VocabularyAppService(
            IRepository<Vocabulary, Guid> vocabRepo,
            IAudioGenerationService audioService,
            IImageGenerationService imageService,
            IFusionCache cache)
        {
            _vocabRepo = vocabRepo;
            _audioService = audioService;
            _imageService = imageService;
            _cache = cache;
        }

        [AllowAnonymous]
        public async Task<List<VocabularyDto>> GetListByLessonAsync(Guid lessonId)
        {
            return await GetCachedVocabsAsync(lessonId);
        }

        // Không cache trực tiếp kết quả quiz (random bị đóng băng) - chỉ cache phần query DB, random vẫn chạy live
        public async Task<List<VocabularyQuizDto>> GetQuizBatchAsync(Guid lessonId)
        {
            var vocabs = await GetCachedVocabsRawAsync(lessonId);
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
        [CustomRateLimit(3, 0.0017)]
        public async Task<VocabularyDto> CreateAsync(CreateUpdateVocabularyDto input)
        {
            await GenerateMediaIfMissingAsync(input);
            var vocab = ObjectMapper.Map<CreateUpdateVocabularyDto, Vocabulary>(input);
            await _vocabRepo.InsertAsync(vocab);
            await InvalidateLessonCachesAsync(vocab.LessonId);
            return ObjectMapper.Map<Vocabulary, VocabularyDto>(vocab);
        }
        // Nhập hàng loạt - Admin CMS paste JSON danh sách từ vựng đã soạn sẵn.
        // Item nào chưa có AudioUrl sẽ được tự động sinh audio qua Gemini TTS trước khi lưu.
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        [CustomRateLimit(3, 0.0017)]
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

            using var semaphore = new SemaphoreSlim(MaxConcurrentGeneration);

            async Task GenerateWithLimitAsync(CreateUpdateVocabularyDto x)
            {
                await semaphore.WaitAsync();
                try
                {
                    if (string.IsNullOrWhiteSpace(x.AudioUrl))
                    {
                        x.AudioUrl = await _audioService.GenerateAudioUrlAsync(x.Word);
                    }
                    if (string.IsNullOrWhiteSpace(x.ImageUrl))
                    {
                        x.ImageUrl = await _imageService.GenerateImageUrlAsync(x.Word, x.Meaning, x.WordType, x.ImageHint);
                    }
                }
                catch (Exception ex)
                {
                    // 1 từ lỗi sinh media không làm sập cả batch - log lại, để URL rỗng, vẫn tạo Vocabulary bình thường
                    Logger.LogWarning(ex, "Không sinh được audio/ảnh cho từ '{Word}'", x.Word);
                }
                finally
                {
                    semaphore.Release();
                }
            }

            await Task.WhenAll(inputs.Select(GenerateWithLimitAsync));

            var vocabs = inputs
                .Select(x => ObjectMapper.Map<CreateUpdateVocabularyDto, Vocabulary>(x))
                .ToList();

            await _vocabRepo.InsertManyAsync(vocabs);
            var affectedLessonIds = inputs.Select(x => x.LessonId).Distinct();
            foreach (var lessonId in affectedLessonIds)
            {
                await InvalidateLessonCachesAsync(lessonId);
            }
            return ObjectMapper.Map<List<Vocabulary>, List<VocabularyDto>>(vocabs);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<VocabularyDto> UpdateAsync(Guid id, CreateUpdateVocabularyDto input)
        {
            await GenerateMediaIfMissingAsync(input);
            var vocab = await _vocabRepo.GetAsync(id);
            var oldLessonId = vocab.LessonId;
            ObjectMapper.Map(input, vocab);
            await _vocabRepo.UpdateAsync(vocab);
            await InvalidateLessonCachesAsync(oldLessonId);
            if (vocab.LessonId != oldLessonId)
            {
                await InvalidateLessonCachesAsync(vocab.LessonId);
            }
            return ObjectMapper.Map<Vocabulary, VocabularyDto>(vocab);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            var vocab = await _vocabRepo.GetAsync(id);
            await _vocabRepo.DeleteAsync(id);
            await InvalidateLessonCachesAsync(vocab.LessonId);
        }
        private async Task GenerateMediaIfMissingAsync(CreateUpdateVocabularyDto input)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(input.AudioUrl))
                {
                    input.AudioUrl = await _audioService.GenerateAudioUrlAsync(input.Word);
                }
                if (string.IsNullOrWhiteSpace(input.ImageUrl))
                {
                    input.ImageUrl = await _imageService.GenerateImageUrlAsync(
                        input.Word, input.Meaning, input.WordType, input.ImageHint);
                }
            }
            catch (Exception ex)
            {
                // Lỗi sinh media không chặn việc tạo/sửa Vocabulary - log lại, để URL rỗng
                Logger.LogWarning(ex, "Không sinh được audio/ảnh cho từ '{Word}'", input.Word);
            }
        }
        private async Task<List<VocabularyDto>> GetCachedVocabsAsync(Guid lessonId)
        {
            var vocabs = await GetCachedVocabsRawAsync(lessonId);
            return ObjectMapper.Map<List<Vocabulary>, List<VocabularyDto>>(vocabs);
        }

        // Cache entity gốc, dùng chung cho cả GetListByLessonAsync và GetQuizBatchAsync
        private async Task<List<Vocabulary>> GetCachedVocabsRawAsync(Guid lessonId)
        {
            var cacheKey = $"vocabulary:by-lesson:{lessonId}";
            return await _cache.GetOrSetAsync(cacheKey, async _ =>
            {
                var queryable = await _vocabRepo.GetQueryableAsync();
                return await AsyncExecuter.ToListAsync(queryable.Where(x => x.LessonId == lessonId));
            });
        }
        // Xóa cả cache vocab lẫn cache lesson-content (vì lesson-content có gộp Vocabularies bên trong)
        private async Task InvalidateLessonCachesAsync(Guid lessonId)
        {
            await _cache.RemoveAsync($"vocabulary:by-lesson:{lessonId}");
            await _cache.RemoveAsync($"lesson:content:{lessonId}");
        }

    }
}