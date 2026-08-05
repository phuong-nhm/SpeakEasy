using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Content
{
    // Cấp độ lớn nhất: B1, B2...
    public class Level : Entity<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }

        // Navigation: 1 Level có nhiều Chapter
        public ICollection<Chapter> Chapters { get; set; }

        protected Level()
        {
            Chapters = new List<Chapter>();
        }

        public Level(Guid id, string name, string description = null) : base(id)
        {
            Name = name;
            Description = description;
            Chapters = new List<Chapter>();
        }
    }
}
