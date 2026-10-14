using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Story
{
    // Bảng nối: agent đã dùng từ vựng nào trong truyện, để FE highlight + click xem nghĩa/audio
    public class StoryVocabulary : Entity<Guid>
    {
        public Guid StoryId { get; set; }
        public Guid VocabularyId { get; set; } // tận dụng Vocabulary đã có sẵn

        public Story Story { get; set; }

        protected StoryVocabulary() { }

        public StoryVocabulary(Guid id, Guid storyId, Guid vocabularyId) : base(id)
        {
            StoryId = storyId;
            VocabularyId = vocabularyId;
        }
    }
    // Lưu ý: unique index (StoryId, VocabularyId) sẽ khai báo ở EfCore DbContext.OnModelCreating, không phải trong entity

}
