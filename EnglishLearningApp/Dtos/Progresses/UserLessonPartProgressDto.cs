namespace EnglishLearningApp.Dtos.Progresses
{
    public class UserLessonPartProgressDto
    {
        public Guid LessonId { get; set; }
        public bool IsVocabularyCompleted { get; set; }
        public bool IsGrammarCompleted { get; set; }
        public bool IsComprehensiveCompleted { get; set; }
    }

    public enum LessonPart
    {
        Vocabulary = 0,
        Grammar = 1,
        Comprehensive = 2,
    }

    public class MarkPartCompletedDto
    {
        public Guid LessonId { get; set; }
        public LessonPart Part { get; set; }
    }
}
