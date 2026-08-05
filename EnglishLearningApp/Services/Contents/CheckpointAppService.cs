using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using Volo.Abp.Domain.Repositories;

namespace EnglishLearningApp.AppServices.Contents
{
    public class CheckpointAppService : EnglishLearningAppAppService, ICheckpointAppService
    {
        private readonly IRepository<Lesson, Guid> _lessonRepo;
        private readonly IRepository<Vocabulary, Guid> _vocabRepo;
        private readonly IRepository<SentenceExercise, Guid> _sentenceRepo;

        public CheckpointAppService(
            IRepository<Lesson, Guid> lessonRepo,
            IRepository<Vocabulary, Guid> vocabRepo,
            IRepository<SentenceExercise, Guid> sentenceRepo)
        {
            _lessonRepo = lessonRepo;
            _vocabRepo = vocabRepo;
            _sentenceRepo = sentenceRepo;
        }

        public async Task<List<CheckpointQuestionDto>> GetCheckpointQuestionsAsync(Guid chapterId, int count)
        {
            var lessonQueryable = await _lessonRepo.GetQueryableAsync();
            var lessonIds = await AsyncExecuter.ToListAsync(
                lessonQueryable.Where(x => x.ChapterId == chapterId).Select(x => x.Id));

            var vocabQueryable = await _vocabRepo.GetQueryableAsync();
            var vocabs = await AsyncExecuter.ToListAsync(
                vocabQueryable.Where(x => lessonIds.Contains(x.LessonId)));

            var sentenceQueryable = await _sentenceRepo.GetQueryableAsync();
            var sentences = await AsyncExecuter.ToListAsync(
                sentenceQueryable.Where(x => lessonIds.Contains(x.LessonId)));

            var random = new Random();

            var vocabQuestions = vocabs.Select(v =>
            {
                var isCorrectFirst = random.Next(2) == 0;
                return new CheckpointQuestionDto
                {
                    SourceId = v.Id,
                    QuestionType = "Vocabulary",
                    VocabularyQuiz = new VocabularyQuizDto
                    {
                        VocabularyId = v.Id,
                        Word = v.Word,
                        ImageUrl = v.ImageUrl,
                        AudioUrl = v.AudioUrl,
                        OptionA = isCorrectFirst ? v.Meaning : v.Distractor,
                        OptionB = isCorrectFirst ? v.Distractor : v.Meaning,
                        CorrectOption = isCorrectFirst ? "A" : "B"
                    }
                };
            });

            var sentenceQuestions = sentences.Select(s => new CheckpointQuestionDto
            {
                SourceId = s.Id,
                QuestionType = "Sentence",
                SentenceQuiz = new SentenceExerciseDto
                {
                    Id = s.Id,
                    LessonId = s.LessonId,
                    SectionType = s.SectionType,
                    AudioUrl = s.AudioUrl,
                    ShuffledWords = s.CorrectSentence.Split(' ').OrderBy(_ => random.Next()).ToList()
                }
            });

            var allQuestions = vocabQuestions.Concat(sentenceQuestions).ToList();

            return allQuestions.OrderBy(_ => random.Next()).Take(count).ToList();
        }
    }
}
