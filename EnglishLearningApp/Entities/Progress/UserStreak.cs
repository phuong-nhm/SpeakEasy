using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Progress
{
    public class UserStreak : AuditedEntity<Guid>
    {
        public Guid UserId { get; set; } // unique
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime? LastStudyDate { get; set; } // chỉ lưu ngày (so sánh .Date), không cần giờ phút

        protected UserStreak() { }

        public UserStreak(Guid id, Guid userId) : base(id)
        {
            UserId = userId;
            CurrentStreak = 0;
            LongestStreak = 0;
        }

        // Gọi mỗi lần user hoàn thành ít nhất 1 Lesson trong ngày (hook vào finalizeLesson chỗ markLessonCompleted)
        public void RecordStudyToday()
        {
            var today = DateTime.UtcNow.Date;
            if (LastStudyDate?.Date == today) return; // đã tính hôm nay rồi, bỏ qua

            CurrentStreak = LastStudyDate?.Date == today.AddDays(-1) ? CurrentStreak + 1 : 1;
            LongestStreak = Math.Max(LongestStreak, CurrentStreak);
            LastStudyDate = today;
        }
    }
}
