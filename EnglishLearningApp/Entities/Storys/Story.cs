using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Story
{
    public class Story : Entity<Guid>
    {
        public Guid LevelId { get; set; } // chốt dùng LevelId (không dùng ChapterId) - truyện tính theo mốc Level rộng hơn
        public string Title { get; set; }
        public StoryGenre Genre { get; set; }
        public StoryLength Length { get; set; }
        public bool HasImages { get; set; }
        public Guid? CreatedForUserId { get; set; } // null = truyện chung dùng lại được
        public StoryGenerationSource GenerationSource { get; set; }

        public ICollection<StorySegment> Segments { get; set; }
        public ICollection<StoryVocabulary> StoryVocabularies { get; set; }

        protected Story()
        {
            Segments = new List<StorySegment>();
            StoryVocabularies = new List<StoryVocabulary>();
        }

        public Story(
            Guid id, Guid levelId, string title, StoryGenre genre,
            StoryLength length, bool hasImages, StoryGenerationSource generationSource,
            Guid? createdForUserId = null) : base(id)
        {
            LevelId = levelId;
            Title = title;
            Genre = genre;
            Length = length;
            HasImages = hasImages;
            GenerationSource = generationSource;
            CreatedForUserId = createdForUserId;
            Segments = new List<StorySegment>();
            StoryVocabularies = new List<StoryVocabulary>();
        }
    }
}
