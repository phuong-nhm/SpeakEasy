using EnglishLearningApp.Dtos.Progresses;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Progress;
using EnglishLearningApp.Entities.Social;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EnglishLearningApp.Services.Progresses
{
    public class UserXpAppService : EnglishLearningAppAppService, IUserXpAppService
    {
        private readonly IRepository<UserXpLog, Guid> _xpRepo;
        private readonly IRepository<Friendship, Guid> _friendshipRepo;
        private readonly Volo.Abp.Identity.IIdentityUserRepository _userRepo;

        public UserXpAppService(
            IRepository<UserXpLog, Guid> xpRepo,
            IRepository<Friendship, Guid> friendshipRepo,
            Volo.Abp.Identity.IIdentityUserRepository userRepo)
        {
            _xpRepo = xpRepo;
            _friendshipRepo = friendshipRepo;
            _userRepo = userRepo;
        }

        // Gọi từ các AppService khác (LessonAppService lúc finalize, CheckpointAppService...)
        // theo số câu đúng - không expose Authorize đặc biệt, chỉ cần đăng nhập
        public async Task RecordXpAsync(RecordXpDto input)
        {
            var currentUserId = CurrentUser.GetId();
            var log = new UserXpLog(GuidGenerator.Create(), currentUserId, input.Amount, input.Source, input.RelatedEntityId);
            await _xpRepo.InsertAsync(log);
        }

        public async Task<MyXpSummaryDto> GetMySummaryAsync()
        {
            var currentUserId = CurrentUser.GetId();
            var weekStart = GetWeekStart(DateTime.UtcNow);

            var queryable = await _xpRepo.GetQueryableAsync();
            var mine = queryable.Where(x => x.UserId == currentUserId);

            var totalXp = await AsyncExecuter.SumAsync(mine.Select(x => (int?)x.Amount)) ?? 0;
            var weeklyXp = await AsyncExecuter.SumAsync(
                mine.Where(x => x.CreationTime >= weekStart).Select(x => (int?)x.Amount)) ?? 0;

            return new MyXpSummaryDto { WeeklyXp = weeklyXp, TotalXp = totalXp };
        }

        public async Task<LeaderboardResultDto> GetWeeklyLeaderboardAsync(int top = 50)
        {
            var weekStart = GetWeekStart(DateTime.UtcNow);
            var queryable = await _xpRepo.GetQueryableAsync();
            var grouped = queryable.Where(x => x.CreationTime >= weekStart);
            return await BuildLeaderboardAsync(grouped, top);
        }

        public async Task<LeaderboardResultDto> GetAllTimeLeaderboardAsync(int top = 50)
        {
            var queryable = await _xpRepo.GetQueryableAsync();
            return await BuildLeaderboardAsync(queryable, top);
        }

        // Xếp hạng trong phạm vi bạn bè (2 chiều, Status=Accepted) + chính mình, theo tuần
        public async Task<LeaderboardResultDto> GetFriendsWeeklyLeaderboardAsync()
        {
            var currentUserId = CurrentUser.GetId();
            var friendshipQueryable = await _friendshipRepo.GetQueryableAsync();
            var friendships = await AsyncExecuter.ToListAsync(friendshipQueryable.Where(x =>
                x.Status == FriendshipStatus.Accepted &&
                (x.RequesterId == currentUserId || x.AddresseeId == currentUserId)));

            var friendIds = friendships
                .Select(f => f.RequesterId == currentUserId ? f.AddresseeId : f.RequesterId)
                .Append(currentUserId)
                .Distinct()
                .ToList();

            var weekStart = GetWeekStart(DateTime.UtcNow);
            var queryable = await _xpRepo.GetQueryableAsync();
            var grouped = queryable.Where(x => x.CreationTime >= weekStart && friendIds.Contains(x.UserId));

            return await BuildLeaderboardAsync(grouped, friendIds.Count);
        }

        private async Task<LeaderboardResultDto> BuildLeaderboardAsync(IQueryable<UserXpLog> queryable, int top)
        {
            var currentUserId = CurrentUser.GetId();

            var summed = await AsyncExecuter.ToListAsync(
                queryable.GroupBy(x => x.UserId)
                    .Select(g => new { UserId = g.Key, Xp = g.Sum(x => x.Amount) })
                    .OrderByDescending(x => x.Xp));

            var entries = new List<LeaderboardEntryDto>();
            var rank = 1;
            foreach (var row in summed.Take(top))
            {
                var user = await _userRepo.FindAsync(row.UserId);
                entries.Add(new LeaderboardEntryDto
                {
                    UserId = row.UserId,
                    UserName = user?.UserName ?? "Unknown",
                    XpThisPeriod = row.Xp,
                    Rank = rank,
                    IsCurrentUser = row.UserId == currentUserId
                });
                rank++;
            }

            var currentUserRank = summed
                .Select((x, index) => new { x.UserId, Rank = index + 1 })
                .FirstOrDefault(x => x.UserId == currentUserId)?.Rank;

            return new LeaderboardResultDto { Entries = entries, CurrentUserRank = currentUserRank };
        }

        // Tuần bắt đầu từ Thứ 2 (ISO), giờ UTC
        private static DateTime GetWeekStart(DateTime utcNow)
        {
            var diff = (7 + (utcNow.DayOfWeek - DayOfWeek.Monday)) % 7;
            return utcNow.Date.AddDays(-diff);
        }
    }
}
