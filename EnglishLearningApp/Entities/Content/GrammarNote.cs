using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Content
{
    public class GrammarNote : Entity<Guid>
    {
        public Guid LessonId { get; set; } // Unique - 1 Lesson chỉ có 1 GrammarNote
        public string Title { get; set; } // ví dụ "Present Simple"
        public string UsageNote { get; set; } // giải thích khi nào dùng, nullable

        public Lesson Lesson { get; set; }
        public ICollection<GrammarStructureItem> Structures { get; set; }

        protected GrammarNote()
        {
            Structures = new List<GrammarStructureItem>();
        }

        public GrammarNote(Guid id, Guid lessonId, string title, string usageNote = null) : base(id)
        {
            LessonId = lessonId;
            Title = title;
            UsageNote = usageNote;
            Structures = new List<GrammarStructureItem>();
        }
    }
}
