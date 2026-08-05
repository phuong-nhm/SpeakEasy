using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Content
{
    // Chương, thuộc về 1 Level, chứa nhiều Lesson
    public class Chapter : Entity<Guid>
    {
        public Guid LevelId { get; set; }
        public string Title { get; set; }
        public int OrderIndex { get; set; }

        // Navigation: trỏ ngược về Level cha
        public Level Level { get; set; }

        // Navigation: 1 Chapter có nhiều Lesson
        public ICollection<Lesson> Lessons { get; set; }

        protected Chapter()
        {
            Lessons = new List<Lesson>();
        }

        public Chapter(Guid id, Guid levelId, string title, int orderIndex) : base(id)
        {
            LevelId = levelId;
            Title = title;
            OrderIndex = orderIndex;
            Lessons = new List<Lesson>();
        }
    }
}
