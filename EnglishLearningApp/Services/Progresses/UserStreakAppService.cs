using EnglishLearningApp.Dtos.Progresses;
using EnglishLearningApp.Entities.Progress;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EnglishLearningApp.Services.Progresses
{
    public class UserStreakAppService : EnglishLearningAppAppService, IUserStreakAppService
    {
        private readonly IRepository<UserStreak, Guid> _streakRepo;

        public UserStreakAppService(IRepository<UserStreak, Guid> streakRepo)
        {
            _streakRepo = streakRepo;
        }

        // Gọi từ finalizeLesson (chỗ markLessonCompleted) mỗi lần user hoàn thành Lesson
        public async Task RecordStudyTodayAsync()
        {
            var currentUserId = CurrentUser.GetId();
            var queryable = await _streakRepo.GetQueryableAsync();
            var streak = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(x => x.UserId == currentUserId));

            if (streak == null)
            {
                streak = new UserStreak(GuidGenerator.Create(), currentUserId);
                streak.RecordStudyToday();
                await _streakRepo.InsertAsync(streak);
                return;
            }

            streak.RecordStudyToday();
            await _streakRepo.UpdateAsync(streak);
        }

        // Tự reset về 0 nếu đã quá 1 ngày không học, không cần cron job riêng
        public async Task<UserStreakDto> GetMyStreakAsync()
        {
            var currentUserId = CurrentUser.GetId();
            var queryable = await _streakRepo.GetQueryableAsync();
            var streak = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(x => x.UserId == currentUserId));

            if (streak == null)
            {
                return new UserStreakDto { CurrentStreak = 0, LongestStreak = 0, LastStudyDate = null };
            }

            if (streak.LastStudyDate.HasValue && streak.LastStudyDate.Value.Date < DateTime.UtcNow.Date.AddDays(-1))
            {
                streak.CurrentStreak = 0;
                await _streakRepo.UpdateAsync(streak);
            }

            return ObjectMapper.Map<UserStreak, UserStreakDto>(streak);
        }
    }
}
