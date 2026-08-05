using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Content
{
    // Bài tập xếp câu (Grammar) hoặc câu trong phần Review
    public class SentenceExercise : Entity<Guid>
    {
        public Guid LessonId { get; set; }
        public SectionType SectionType { get; set; }
        public string CorrectSentence { get; set; }
        public string AudioUrl { get; set; }

        // Navigation: trỏ ngược về Lesson cha
        public Lesson Lesson { get; set; }

        protected SentenceExercise() { }

        public SentenceExercise(
            Guid id,
            Guid lessonId,
            SectionType sectionType,
            string correctSentence,
            string audioUrl = null) : base(id)
        {
            LessonId = lessonId;
            SectionType = sectionType;
            CorrectSentence = correctSentence;
            AudioUrl = audioUrl;
        }

        // Xếp block từ bị xáo trộn: tách CorrectSentence lúc runtime, không cần lưu riêng trong DB
        public string[] GetShuffledWords()
        {
            var words = CorrectSentence.Split(' ');
            var random = new Random();
            return words.OrderBy(_ => random.Next()).ToArray();
        }
    }
}
