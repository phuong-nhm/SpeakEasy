using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Progresses;
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
    public class UserLessonReviewAppService : EnglishLearningAppAppService, IUserLessonReviewAppService
    {
        // Mốc thời gian tương ứng từng stage: 0=3h,1=1d,2=3d,3=1w,4=2w,5=1m
        private static readonly TimeSpan[] IntervalStages =
        {
            TimeSpan.FromHours(3),
            TimeSpan.FromDays(1),
            TimeSpan.FromDays(3),
            TimeSpan.FromDays(7),
            TimeSpan.FromDays(14),
            TimeSpan.FromDays(30)
        };

        private readonly IRepository<UserLessonReview, Guid> _reviewRepo;
        private readonly IRepository<Lesson, Guid> _lessonRepo;
        private readonly ICurrentUser _currentUser;

        public UserLessonReviewAppService(
            IRepository<UserLessonReview, Guid> reviewRepo,
            IRepository<Lesson, Guid> lessonRepo,
            ICurrentUser currentUser)
        {
            _reviewRepo = reviewRepo;
            _lessonRepo = lessonRepo;
            _currentUser = currentUser;
        }

        public async Task InitReviewAsync(Guid lessonId)
        {
            var userId = _currentUser.GetId();

            await _reviewRepo.InsertAsync(new UserLessonReview
            (
                GuidGenerator.Create(),
                userId,
                lessonId
            ));
        }

        public async Task<DueReviewSummaryDto> GetDueReviewsAsync()
        {
            var userId = _currentUser.GetId();
            var now = DateTime.Now;

            var reviewQueryable = await _reviewRepo.GetQueryableAsync();
            var query = reviewQueryable.Where(x => x.UserId == userId
                                                    && x.NextReviewTime <= now
                                                    && !x.IsCompletedAllStages);

            var dueReviews = await AsyncExecuter.ToListAsync(query);

            if (!dueReviews.Any())
            {
                return new DueReviewSummaryDto { Count = 0, Items = new List<DueReviewItemDto>() };
            }

            var lessonIds = dueReviews.Select(x => x.LessonId).ToList();
            var lessonQueryable = await _lessonRepo.GetQueryableAsync();
            var lessons = await AsyncExecuter.ToListAsync(
                lessonQueryable.Where(x => lessonIds.Contains(x.Id)));
            var lessonTitles = lessons.ToDictionary(x => x.Id, x => x.Title);

            var items = dueReviews.Select(x => new DueReviewItemDto
            {
                LessonId = x.LessonId,
                LessonTitle = lessonTitles.GetValueOrDefault(x.LessonId, ""),
                NextReviewTime = x.NextReviewTime
            }).ToList();

            return new DueReviewSummaryDto { Count = items.Count, Items = items };
        }

        public async Task CompleteReviewAsync(CompleteReviewDto input)
        {
            var userId = _currentUser.GetId();
            var queryable = await _reviewRepo.GetQueryableAsync();
            var query = queryable.Where(x => x.UserId == userId && x.LessonId == input.LessonId);

            var review = await AsyncExecuter.FirstAsync(query);

            if (input.IsCorrect)
            {
                var nextStage = review.CurrentIntervalStage + 1;
                if (nextStage >= IntervalStages.Length)
                {
                    review.IsCompletedAllStages = true;
                }
                else
                {
                    review.CurrentIntervalStage = nextStage;
                    review.NextReviewTime = DateTime.Now.Add(IntervalStages[nextStage]);
                }
            }
            else
            {
                review.CurrentIntervalStage = 0;
                review.NextReviewTime = DateTime.Now.Add(IntervalStages[0]);
            }

            await _reviewRepo.UpdateAsync(review);
        }
    }
}
