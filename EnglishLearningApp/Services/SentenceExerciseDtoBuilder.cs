using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using Volo.Abp.ObjectMapping;

namespace EnglishLearningApp.Services
{
    public static class SentenceExerciseDtoBuilder
    {
        public static SentenceExerciseDto Build(SentenceExercise exercise, IObjectMapper objectMapper)
        {
            var dto = objectMapper.Map<SentenceExercise, SentenceExerciseDto>(exercise);
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
                        dto.DialogueGroupId = exercise.DialogueGroupId;
                        dto.OrderInGroup = exercise.OrderInGroup;
                        break;
                    }

                case ExerciseType.ListenChoose:
                    {
                        var options = new List<string> { exercise.CorrectSentence, exercise.DistractorSentence };
                        dto.ListenOptions = options.OrderBy(_ => random.Next()).ToList();
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
