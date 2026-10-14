using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Story
{
    public class StorySegment : Entity<Guid>
    {
        public Guid StoryId { get; set; }
        public int OrderIndex { get; set; }
        public string Content { get; set; }
        public string? ImageUrl { get; set; } // null hết nếu Story.HasImages=false

        public Story Story { get; set; }

        protected StorySegment() { }

        public StorySegment(Guid id, Guid storyId, int orderIndex, string content, string? imageUrl = null) : base(id)
        {
            StoryId = storyId;
            OrderIndex = orderIndex;
            Content = content;
            ImageUrl = imageUrl;
        }
    }
}
