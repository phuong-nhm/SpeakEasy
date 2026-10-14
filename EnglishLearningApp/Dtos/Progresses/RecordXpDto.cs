using EnglishLearningApp.Entities;

namespace EnglishLearningApp.Dtos.Progresses
{
    public class RecordXpDto
    {
        public int Amount { get; set; }
        public XpSource Source { get; set; }
        public Guid? RelatedEntityId { get; set; }
    }

    // 1 dòng trong bảng xếp hạng
    public class LeaderboardEntryDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public int XpThisPeriod { get; set; }
        public int Rank { get; set; }
        public bool IsCurrentUser { get; set; }
    }

    public class LeaderboardResultDto
    {
        public List<LeaderboardEntryDto> Entries { get; set; } = new();
        public int? CurrentUserRank { get; set; }
    }

    public class MyXpSummaryDto
    {
        public int WeeklyXp { get; set; }
        public int TotalXp { get; set; }
    }
}
