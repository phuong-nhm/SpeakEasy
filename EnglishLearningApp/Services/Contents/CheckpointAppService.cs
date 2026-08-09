using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
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

        [Authorize]
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

            // Build SentenceQuiz theo đúng ExerciseType - logic giống hệt
            // SentenceExerciseAppService.BuildDto, chỉ viết lại vì nằm trong vòng Select riêng
            var sentenceQuestions = sentences.Select(s => new CheckpointQuestionDto
            {
                SourceId = s.Id,
                QuestionType = "Sentence",
                SentenceQuiz = BuildSentenceQuizDto(s, random)
            });

            var allQuestions = vocabQuestions.Concat(sentenceQuestions).ToList();
            return allQuestions.OrderBy(_ => random.Next()).Take(count).ToList();
        }

        private static SentenceExerciseDto BuildSentenceQuizDto(SentenceExercise s, Random random)
        {
            var dto = new SentenceExerciseDto
            {
                Id = s.Id,
                LessonId = s.LessonId,
                SectionType = s.SectionType,
                AudioUrl = s.AudioUrl,
                ExerciseType = s.ExerciseType
            };

            switch (s.ExerciseType)
            {
                case ExerciseType.FillInBlank:
                    {
                        var words = s.CorrectSentence.Split(' ');
                        var blankIndex = random.Next(words.Length);
                        var displayWords = (string[])words.Clone();
                        displayWords[blankIndex] = "_____";

                        dto.DisplaySentence = string.Join(" ", displayWords);
                        dto.BlankIndex = blankIndex;
                        break;
                    }

                case ExerciseType.AnswerQuestion:
                    {
                        dto.PromptText = s.PromptText;
                        break;
                    }

                case ExerciseType.TranslateFromVietnamese:
                    {
                        dto.VietnameseTranslation = s.VietnameseTranslation;
                        dto.ShuffledWords = s.CorrectSentence.Split(' ').OrderBy(_ => random.Next()).ToList();
                        break;
                    }

                default: // WordOrder
                    {
                        dto.ShuffledWords = s.CorrectSentence.Split(' ').OrderBy(_ => random.Next()).ToList();
                        break;
                    }
            }

            return dto;
        }
    }
}