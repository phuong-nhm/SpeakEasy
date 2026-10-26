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
using Volo.Abp.Domain.Repositories;
using ZiggyCreatures.Caching.Fusion;

namespace EnglishLearningApp.AppServices.Contents
{
    public class LessonAppService : EnglishLearningAppAppService, ILessonAppService
    {
        private readonly IRepository<Lesson, Guid> _lessonRepo;
        private readonly IRepository<Vocabulary, Guid> _vocabRepo;
        private readonly IRepository<SentenceExercise, Guid> _sentenceRepo;
        private readonly IFusionCache _cache;

        public LessonAppService(
            IRepository<Lesson, Guid> lessonRepo,
            IRepository<Vocabulary, Guid> vocabRepo,
            IRepository<SentenceExercise, Guid> sentenceRepo,
            IFusionCache cache)
        {
            _lessonRepo = lessonRepo;
            _vocabRepo = vocabRepo;
            _sentenceRepo = sentenceRepo;
            _cache = cache;
        }

        [AllowAnonymous]
        public async Task<List<LessonDto>> GetListByChapterAsync(Guid chapterId)
        {
            var cacheKey = $"lesson:by-chapter:{chapterId}";
            return await _cache.GetOrSetAsync(cacheKey, async _ =>
            {
                var queryable = await _lessonRepo.GetQueryableAsync();
                var lessons = await AsyncExecuter.ToListAsync(
                    queryable.Where(x => x.ChapterId == chapterId).OrderBy(x => x.OrderIndex));
                return ObjectMapper.Map<List<Lesson>, List<LessonDto>>(lessons);
            });
        }
        [AllowAnonymous]
        public async Task<LessonDto> GetAsync(Guid id)
        {
            var lesson = await _lessonRepo.GetAsync(id);
            return ObjectMapper.Map<Lesson, LessonDto>(lesson);
        }
        [AllowAnonymous]
        public async Task<LessonContentDto> GetLessonContentAsync(Guid lessonId)
        {
            var cacheKey = $"lesson:content:{lessonId}";
            return await _cache.GetOrSetAsync(cacheKey, async _ =>
            {
                var lesson = await _lessonRepo.GetAsync(lessonId);

                var vocabQueryable = await _vocabRepo.GetQueryableAsync();
                var vocabs = await AsyncExecuter.ToListAsync(
                    vocabQueryable.Where(x => x.LessonId == lessonId));

                var sentenceQueryable = await _sentenceRepo.GetQueryableAsync();
                var sentences = await AsyncExecuter.ToListAsync(
                    sentenceQueryable.Where(x => x.LessonId == lessonId));

                return new LessonContentDto
                {
                    Lesson = ObjectMapper.Map<Lesson, LessonDto>(lesson),
                    Vocabularies = ObjectMapper.Map<List<Vocabulary>, List<VocabularyDto>>(vocabs),
                    Sentences = sentences.Select(x => SentenceExerciseDtoBuilder.Build(x, ObjectMapper)).ToList()
                };
            });
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<LessonDto> CreateAsync(CreateUpdateLessonDto input)
        {
            var lesson = ObjectMapper.Map<CreateUpdateLessonDto, Lesson>(input);
            await _lessonRepo.InsertAsync(lesson);
            await _cache.RemoveAsync($"lesson:by-chapter:{lesson.ChapterId}");
            return ObjectMapper.Map<Lesson, LessonDto>(lesson);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<LessonDto> UpdateAsync(Guid id, CreateUpdateLessonDto input)
        {
            var lesson = await _lessonRepo.GetAsync(id);
            var oldChapterId = lesson.ChapterId;
            ObjectMapper.Map(input, lesson);
            await _lessonRepo.UpdateAsync(lesson);
            await _cache.RemoveAsync($"lesson:by-chapter:{oldChapterId}");
            if (lesson.ChapterId != oldChapterId)
            {
                await _cache.RemoveAsync($"lesson:by-chapter:{lesson.ChapterId}");
            }
            await _cache.RemoveAsync($"lesson:content:{id}"); // nội dung lesson có thể đổi trực tiếp
            return ObjectMapper.Map<Lesson, LessonDto>(lesson);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            var lesson = await _lessonRepo.GetAsync(id);
            await _lessonRepo.DeleteAsync(id);
            await _cache.RemoveAsync($"lesson:by-chapter:{lesson.ChapterId}");
            await _cache.RemoveAsync($"lesson:content:{id}");
        }
    }
}
