using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Progresses
{
    public class UserStreakDto : EntityDto<Guid>
    {
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime? LastStudyDate { get; set; }
    }
}
