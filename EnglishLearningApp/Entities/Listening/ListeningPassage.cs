using EnglishLearningApp.Entities.Content;
using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Listening
{
    public class ListeningPassage : Entity<Guid>
    {
        public Guid ChapterId { get; set; } // Unique — 1 Chapter chỉ có 1 Passage

        public string Title { get; set; }
        public string Transcript { get; set; } // Đoạn text gốc, đưa AI TTS đọc ra audio
        public string AudioUrl { get; set; }   // File audio sinh ra từ Transcript
        public ICollection<ListeningQuestion> Questions { get; set; } = new List<ListeningQuestion>();
        public Chapter Chapter { get; set; }

        protected ListeningPassage() { }

        public ListeningPassage(
            Guid id,
            Guid chapterId,
            string transcript,
            string audioUrl = null,
            string title = null) : base(id)
        {
            ChapterId = chapterId;
            Transcript = transcript;
            AudioUrl = audioUrl;
            Title = title;
        }
    }
}
