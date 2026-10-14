using EnglishLearningApp.Entities;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Storys
{
    public class StoryDto : EntityDto<Guid>
    {
        public Guid LevelId { get; set; }
        public string Title { get; set; }
        public StoryGenre Genre { get; set; }
        public StoryLength Length { get; set; }
        public bool HasImages { get; set; }
        public Guid? CreatedForUserId { get; set; }
        public StoryGenerationSource GenerationSource { get; set; }
    }

    // Trả kèm Segment để FE đọc nguyên truyện 1 lần (giống LessonContentDto - DTO tổng hợp, map tay)
    public class StoryDetailDto : StoryDto
    {
        public List<StorySegmentDto> Segments { get; set; } = new();
        public List<Guid> VocabularyIds { get; set; } = new(); // để FE highlight, lấy nghĩa/audio qua VocabularyAppService sẵn có
    }

    public class StorySegmentDto : EntityDto<Guid>
    {
        public int OrderIndex { get; set; }
        public string Content { get; set; }
        public string ImageUrl { get; set; }
    }
    public class CreateUpdateStoryDto
    {
        public Guid LevelId { get; set; }
        public string Title { get; set; }
        public StoryGenre Genre { get; set; }
        public StoryLength Length { get; set; }
        public bool HasImages { get; set; }
        public Guid? CreatedForUserId { get; set; } // chỉ có ý nghĩa lúc Create, Update bỏ qua field này
        public StoryGenerationSource GenerationSource { get; set; } // chỉ có ý nghĩa lúc Create, Update bỏ qua field này

        public List<CreateStorySegmentDto> Segments { get; set; } = new();
        public List<Guid> VocabularyIds { get; set; } = new();
    }

    public class CreateStorySegmentDto
    {
        public int OrderIndex { get; set; }
        public string Content { get; set; }
        public string? ImageUrl { get; set; }
    }
}
