using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Content
{
    // Từ vựng trong 1 Lesson, kèm ảnh + audio + từ gây nhiễu
    public class Vocabulary : Entity<Guid>
    {
        public Guid LessonId { get; set; }
        public string Word { get; set; }
        public string Meaning { get; set; }
        public string ImageUrl { get; set; }
        public string AudioUrl { get; set; }
        public string Distractor { get; set; }

        // Navigation: trỏ ngược về Lesson cha
        public Lesson Lesson { get; set; }
        public WordType WordType { get; set; }
        protected Vocabulary() { }

        public Vocabulary(
            Guid id,
            Guid lessonId,
            string word,
            string meaning,
            string distractor,
            string imageUrl = null,
            string audioUrl = null) : base(id)
        {
            LessonId = lessonId;
            Word = word;
            Meaning = meaning;
            Distractor = distractor;
            ImageUrl = imageUrl;
            AudioUrl = audioUrl;
        }
    }
}
