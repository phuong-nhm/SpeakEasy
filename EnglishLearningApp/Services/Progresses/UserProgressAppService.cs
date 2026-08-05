using System;
using System.Linq;
using System.Threading.Tasks;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Entities.Progress;
using EnglishLearningApp.Services;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EnglishLearningApp.AppServices.Progresses
{
    [Authorize]
    public class UserProgressAppService : EnglishLearningAppAppService, IUserProgressAppService
    {
        private readonly IRepository<UserProgress, Guid> _progressRepo;
        private readonly IRepository<Lesson, Guid> _lessonRepo;
        private readonly ICurrentUser _currentUser;

        public UserProgressAppService(
            IRepository<UserProgress, Guid> progressRepo,
            IRepository<Lesson, Guid> lessonRepo,
            ICurrentUser currentUser)
        {
            _progressRepo = progressRepo;
            _lessonRepo = lessonRepo;
            _currentUser = currentUser;
        }

        public async Task MarkLessonCompletedAsync(Guid lessonId)
        {
            var userId = _currentUser.GetId();
            var queryable = await _progressRepo.GetQueryableAsync();
            var query = queryable.Where(x => x.UserId == userId && x.LessonId == lessonId);

            var existing = await AsyncExecuter.FirstOrDefaultAsync(query);

            if (existing != null)
            {
                existing.IsCompleted = true;
                existing.CompletedAt = DateTime.Now;
                await _progressRepo.UpdateAsync(existing);
            }
            else
            {
                await _progressRepo.InsertAsync(new UserProgress
                (
                    GuidGenerator.Create(),
                    userId,
                    lessonId
                ));
            }
        }

        public async Task<double> GetProgressByChapterAsync(Guid chapterId)
        {
            var userId = _currentUser.GetId();

            var lessonQueryable = await _lessonRepo.GetQueryableAsync();
            var lessonIds = await AsyncExecuter.ToListAsync(
                lessonQueryable.Where(x => x.ChapterId == chapterId).Select(x => x.Id));

            if (!lessonIds.Any())
            {
                return 0;
            }

            var progressQueryable = await _progressRepo.GetQueryableAsync();
            var query = progressQueryable.Where(x => x.UserId == userId
                                                       && lessonIds.Contains(x.LessonId)
                                                       && x.IsCompleted);

            var completedCount = await AsyncExecuter.CountAsync(query);

            return (double)completedCount / lessonIds.Count * 100;
        }
    }
}
