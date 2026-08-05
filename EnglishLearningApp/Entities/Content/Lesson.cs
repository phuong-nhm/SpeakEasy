using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Content
{
    // Bài học, thuộc về 1 Chapter, chứa nhiều Vocabulary + SentenceExercise
    public class Lesson : Entity<Guid>
    {
        public Guid ChapterId { get; set; }
        public string Title { get; set; }
        public LessonType LessonType { get; set; }
        public int OrderIndex { get; set; }

        // Navigation: trỏ ngược về Chapter cha
        public Chapter Chapter { get; set; }

        // Navigation: 1 Lesson có nhiều Vocabulary
        public ICollection<Vocabulary> Vocabularies { get; set; }

        // Navigation: 1 Lesson có nhiều SentenceExercise
        public ICollection<SentenceExercise> SentenceExercises { get; set; }

        protected Lesson()
        {
            Vocabularies = new List<Vocabulary>();
            SentenceExercises = new List<SentenceExercise>();
        }

        public Lesson(Guid id, Guid chapterId, string title, LessonType lessonType, int orderIndex) : base(id)
        {
            ChapterId = chapterId;
            Title = title;
            LessonType = lessonType;
            OrderIndex = orderIndex;
            Vocabularies = new List<Vocabulary>();
            SentenceExercises = new List<SentenceExercise>();
        }
    }
}
