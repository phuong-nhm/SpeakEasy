using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Entities;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EnglishLearningApp.AppServices.Contents
{
    [Authorize]
    public class MatchingGameAppService : EnglishLearningAppAppService, IMatchingGameAppService
    {
        private const int PassiveRecallVocabCount = 5;

        private readonly IRepository<Vocabulary, Guid> _vocabRepo;
        private readonly IRepository<Lesson, Guid> _lessonRepo;
        private readonly IRepository<UserLessonReview, Guid> _reviewRepo;
        private readonly ICurrentUser _currentUser;

        public MatchingGameAppService(
            IRepository<Vocabulary, Guid> vocabRepo,
            IRepository<Lesson, Guid> lessonRepo,
            IRepository<UserLessonReview, Guid> reviewRepo,
            ICurrentUser currentUser)
        {
            _vocabRepo = vocabRepo;
            _lessonRepo = lessonRepo;
            _reviewRepo = reviewRepo;
            _currentUser = currentUser;
        }

        // Phần 1: lấy thẳng từ vựng của Lesson hiện tại
        public async Task<MatchingGameDto> GetGameForLessonAsync(Guid lessonId)
        {
            var vocabQueryable = await _vocabRepo.GetQueryableAsync();
            var vocabs = await AsyncExecuter.ToListAsync(
                vocabQueryable.Where(x => x.LessonId == lessonId));

            return BuildGameDto(vocabs, isPassiveRecall: false, sourceLessonId: null, sourceLessonTitle: null);
        }

        // Phần 3: quyết định ôn bài cũ (nếu có bài đến hạn) hay lấy từ bài hiện tại/chương hiện tại
        public async Task<MatchingGameDto> GetGameForSummaryAsync(Guid currentLessonId)
        {
            var userId = _currentUser.GetId();
            var now = DateTime.Now;

            // Quét ngầm: có bài cũ nào đến hạn ôn tập không (không đụng/update gì vào UserLessonReview)
            var reviewQueryable = await _reviewRepo.GetQueryableAsync();
            var dueQuery = reviewQueryable.Where(x => x.UserId == userId
                                                        && x.NextReviewTime <= now
                                                        && !x.IsCompletedAllStages
                                                        && x.LessonId != currentLessonId);

            var dueReview = await AsyncExecuter.FirstOrDefaultAsync(dueQuery);

            if (dueReview != null)
            {
                // CÓ bài cũ đến hạn -> bốc ngẫu nhiên từ vựng của bài đó
                var oldLesson = await _lessonRepo.GetAsync(dueReview.LessonId);
                var oldVocabQueryable = await _vocabRepo.GetQueryableAsync();
                var oldVocabs = await AsyncExecuter.ToListAsync(
                    oldVocabQueryable.Where(x => x.LessonId == dueReview.LessonId));

                var random = new Random();
                var picked = oldVocabs.OrderBy(_ => random.Next()).Take(PassiveRecallVocabCount).ToList();

                return BuildGameDto(picked, isPassiveRecall: true, oldLesson.Id, oldLesson.Title);
            }

            // KHÔNG có bài cũ đến hạn -> lấy từ các bài TRƯỚC trong cùng Chương (nếu có),
            // fallback về bài hiện tại nếu đây là bài đầu tiên của Chương
            var currentLesson = await _lessonRepo.GetAsync(currentLessonId);
            var lessonQueryable = await _lessonRepo.GetQueryableAsync();
            var priorLessonIds = await AsyncExecuter.ToListAsync(
                lessonQueryable
                    .Where(x => x.ChapterId == currentLesson.ChapterId && x.OrderIndex < currentLesson.OrderIndex)
                    .Select(x => x.Id));

            var fallbackVocabQueryable = await _vocabRepo.GetQueryableAsync();
            var fallbackPoolIds = priorLessonIds.Any() ? priorLessonIds : new List<Guid> { currentLessonId };
            var fallbackVocabs = await AsyncExecuter.ToListAsync(
                fallbackVocabQueryable.Where(x => fallbackPoolIds.Contains(x.LessonId)));

            var rnd = new Random();
            var fallbackPicked = fallbackVocabs.OrderBy(_ => rnd.Next()).Take(PassiveRecallVocabCount).ToList();

            return BuildGameDto(fallbackPicked, isPassiveRecall: false, null, null);
        }

        // So khớp toàn bộ cặp user gửi lên - mỗi WordVocabularyId phải trùng MeaningVocabularyId
        // (vì Word và Meaning của cùng 1 Vocabulary luôn dùng chung 1 Id)
        public Task<bool> CheckAnswerAsync(CheckMatchingAnswerDto input)
        {
            var allCorrect = input.UserPairs.All(p => p.WordVocabularyId == p.MeaningVocabularyId);
            return Task.FromResult(allCorrect);
        }

        private MatchingGameDto BuildGameDto(
            List<Vocabulary> vocabs,
            bool isPassiveRecall,
            Guid? sourceLessonId,
            string sourceLessonTitle)
        {
            if (!vocabs.Any())
            {
                throw new UserFriendlyException(L["NotEnoughVocabularyForMatchingGame"]);
            }

            var random = new Random();

            var wordColumn = vocabs
                .Select(v => new MatchingItemDto { VocabularyId = v.Id, Text = v.Word })
                .OrderBy(_ => random.Next())
                .ToList();

            var meaningColumn = vocabs
                .Select(v => new MatchingItemDto { VocabularyId = v.Id, Text = v.Meaning })
                .OrderBy(_ => random.Next())
                .ToList();

            return new MatchingGameDto
            {
                WordColumn = wordColumn,
                MeaningColumn = meaningColumn,
                IsPassiveRecall = isPassiveRecall,
                SourceLessonId = sourceLessonId,
                SourceLessonTitle = sourceLessonTitle
            };
        }
    }
}
