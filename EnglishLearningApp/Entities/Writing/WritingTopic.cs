using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Writing
{
    // Chủ đề viết, gắn theo Chapter (không gắn Lesson để tránh 2 FK cùng lúc)
    public class WritingTopic : Entity<Guid>
    {
        public Guid ChapterId { get; set; }
        public WritingTopicType TopicType { get; set; }
        public string PromptTitle { get; set; }

        protected WritingTopic() { }

        public WritingTopic(Guid id, Guid chapterId, WritingTopicType topicType, string promptTitle) : base(id)
        {
            ChapterId = chapterId;
            TopicType = topicType;
            PromptTitle = promptTitle;
        }
    }
}
