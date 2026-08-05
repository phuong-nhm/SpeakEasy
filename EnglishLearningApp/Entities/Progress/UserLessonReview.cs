using Volo.Abp.Domain.Entities.Auditing;

namespace EnglishLearningApp.Entities.Progress
{
    // Theo dõi chu kỳ ôn tập ngắt quãng (spaced repetition) của user cho từng Lesson
    public class UserLessonReview : AuditedEntity<Guid>
    {
        // Mốc thời gian ôn tập chuẩn, theo thứ tự tăng dần
        public static readonly TimeSpan[] IntervalStages =
        {
            TimeSpan.FromHours(3),
            TimeSpan.FromDays(1),
            TimeSpan.FromDays(3),
            TimeSpan.FromDays(7),
            TimeSpan.FromDays(14),
            TimeSpan.FromDays(30)
        };

        public Guid UserId { get; set; }
        public Guid LessonId { get; set; }

        // Chỉ số đang ở mốc nào trong IntervalStages (0 = 3 giờ, 5 = 1 tháng)
        public int CurrentIntervalStage { get; set; }
        public DateTime NextReviewTime { get; set; }
        public bool IsCompletedAllStages { get; set; }

        protected UserLessonReview() { }

        public UserLessonReview(Guid id, Guid userId, Guid lessonId) : base(id)
        {
            UserId = userId;
            LessonId = lessonId;
            CurrentIntervalStage = 0;
            NextReviewTime = DateTime.UtcNow.Add(IntervalStages[0]);
            IsCompletedAllStages = false;
        }

        // Gọi khi user ôn tập xong 1 lần, tự chuyển sang mốc kế tiếp
        public void MoveToNextStage()
        {
            if (CurrentIntervalStage >= IntervalStages.Length - 1)
            {
                IsCompletedAllStages = true;
                return;
            }

            CurrentIntervalStage++;
            NextReviewTime = DateTime.UtcNow.Add(IntervalStages[CurrentIntervalStage]);
        }
    }
}
