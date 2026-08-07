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

namespace EnglishLearningApp.AppServices.Contents
{
    public class LessonAppService : EnglishLearningAppAppService, ILessonAppService
    {
        private readonly IRepository<Lesson, Guid> _lessonRepo;
        private readonly IRepository<Vocabulary, Guid> _vocabRepo;
        private readonly IRepository<SentenceExercise, Guid> _sentenceRepo;

        public LessonAppService(
            IRepository<Lesson, Guid> lessonRepo,
            IRepository<Vocabulary, Guid> vocabRepo,
            IRepository<SentenceExercise, Guid> sentenceRepo)
        {
            _lessonRepo = lessonRepo;
            _vocabRepo = vocabRepo;
            _sentenceRepo = sentenceRepo;
        }
        [AllowAnonymous]
        public async Task<List<LessonDto>> GetListByChapterAsync(Guid chapterId)
        {
            var queryable = await _lessonRepo.GetQueryableAsync();
            var query = queryable
                .Where(x => x.ChapterId == chapterId)
                .OrderBy(x => x.OrderIndex);

            var lessons = await AsyncExecuter.ToListAsync(query);
            return ObjectMapper.Map<List<Lesson>, List<LessonDto>>(lessons);
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
                Sentences = ObjectMapper.Map<List<SentenceExercise>, List<SentenceExerciseDto>>(sentences)
            };
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        public async Task<LessonDto> CreateAsync(CreateUpdateLessonDto input)
        {
            var lesson = ObjectMapper.Map<CreateUpdateLessonDto, Lesson>(input);
            await _lessonRepo.InsertAsync(lesson);
            return ObjectMapper.Map<Lesson, LessonDto>(lesson);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<LessonDto> UpdateAsync(Guid id, CreateUpdateLessonDto input)
        {
            var lesson = await _lessonRepo.GetAsync(id);
            ObjectMapper.Map(input, lesson);
            await _lessonRepo.UpdateAsync(lesson);
            return ObjectMapper.Map<Lesson, LessonDto>(lesson);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            await _lessonRepo.DeleteAsync(id);
        }
    }
}
