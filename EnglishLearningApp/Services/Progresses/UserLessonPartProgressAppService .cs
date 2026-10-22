using EnglishLearningApp.Dtos.Progresses;
using EnglishLearningApp.Entities.Progress;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EnglishLearningApp.Services.Progresses
{
    public class UserLessonPartProgressAppService : EnglishLearningAppAppService, IUserLessonPartProgressAppService
    {
        private readonly IRepository<UserLessonPartProgress, Guid> _partProgressRepo;
        private readonly ICurrentUser _currentUser;

        public UserLessonPartProgressAppService(
            IRepository<UserLessonPartProgress, Guid> partProgressRepo,
            ICurrentUser currentUser)
        {
            _partProgressRepo = partProgressRepo;
            _currentUser = currentUser;
        }

        public async Task<UserLessonPartProgressDto> GetByLessonAsync(Guid lessonId)
        {
            var userId = _currentUser.GetId();
            var queryable = await _partProgressRepo.GetQueryableAsync();
            var existing = await AsyncExecuter.FirstOrDefaultAsync(
                queryable.Where(x => x.UserId == userId && x.LessonId == lessonId));

            // Chưa có record nào -> coi như chưa hoàn thành Part nào cả (mặc định false hết)
            if (existing == null)
            {
                return new UserLessonPartProgressDto { LessonId = lessonId };
            }

            return new UserLessonPartProgressDto
            {
                LessonId = lessonId,
                IsVocabularyCompleted = existing.IsVocabularyCompleted,
                IsGrammarCompleted = existing.IsGrammarCompleted,
                IsComprehensiveCompleted = existing.IsComprehensiveCompleted,
            };
        }

        public async Task MarkPartCompletedAsync(MarkPartCompletedDto input)
        {
            var userId = _currentUser.GetId();
            var queryable = await _partProgressRepo.GetQueryableAsync();
            var existing = await AsyncExecuter.FirstOrDefaultAsync(
                queryable.Where(x => x.UserId == userId && x.LessonId == input.LessonId));

            if (existing == null)
            {
                existing = new UserLessonPartProgress(GuidGenerator.Create(), userId, input.LessonId);
                SetPartCompleted(existing, input.Part);
                await _partProgressRepo.InsertAsync(existing);
                return;
            }

            SetPartCompleted(existing, input.Part);
            await _partProgressRepo.UpdateAsync(existing);
        }

        private static void SetPartCompleted(UserLessonPartProgress entity, LessonPart part)
        {
            switch (part)
            {
                case LessonPart.Vocabulary:
                    entity.IsVocabularyCompleted = true;
                    break;
                case LessonPart.Grammar:
                    entity.IsGrammarCompleted = true;
                    break;
                case LessonPart.Comprehensive:
                    entity.IsComprehensiveCompleted = true;
                    break;
            }
        }
    }
}
