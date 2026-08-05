using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using Volo.Abp.Domain.Repositories;

namespace EnglishLearningApp.AppServices.Contents
{
    public class VocabularyAppService : EnglishLearningAppAppService, IVocabularyAppService
    {
        private readonly IRepository<Vocabulary, Guid> _vocabRepo;

        public VocabularyAppService(IRepository<Vocabulary, Guid> vocabRepo)
        {
            _vocabRepo = vocabRepo;
        }

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

        public async Task<VocabularyDto> CreateAsync(CreateUpdateVocabularyDto input)
        {
            var vocab = ObjectMapper.Map<CreateUpdateVocabularyDto, Vocabulary>(input);
            await _vocabRepo.InsertAsync(vocab);
            return ObjectMapper.Map<Vocabulary, VocabularyDto>(vocab);
        }

        public async Task<VocabularyDto> UpdateAsync(Guid id, CreateUpdateVocabularyDto input)
        {
            var vocab = await _vocabRepo.GetAsync(id);
            ObjectMapper.Map(input, vocab);
            await _vocabRepo.UpdateAsync(vocab);
            return ObjectMapper.Map<Vocabulary, VocabularyDto>(vocab);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _vocabRepo.DeleteAsync(id);
        }
    }
}
