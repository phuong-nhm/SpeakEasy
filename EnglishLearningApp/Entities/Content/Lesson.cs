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

        // Chủ điểm ngữ pháp của Lesson, hiển thị ở đầu Part 2 (Grammar) bên FE
        // Nullable vì không phải Lesson nào cũng có ngữ pháp riêng (ví dụ Lesson ôn tập/checkpoint)
        public string? GrammarTopic { get; set; }

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

        public Lesson(Guid id, Guid chapterId, string title, LessonType lessonType, int orderIndex, string? grammarTopic = null) : base(id)
        {
            ChapterId = chapterId;
            Title = title;
            LessonType = lessonType;
            OrderIndex = orderIndex;
            GrammarTopic = grammarTopic;
            Vocabularies = new List<Vocabulary>();
            SentenceExercises = new List<SentenceExercise>();
        }
    }
}