using EnglishLearningApp.Dtos.Listenings;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Entities.Listening;
using EnglishLearningApp.Infrastructure;
using EnglishLearningApp.Permissions;
using EnglishLearningApp.Services;
using EnglishLearningApp.Services.Contents;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using ZiggyCreatures.Caching.Fusion;

namespace EnglishLearningApp.Services.Listenings
{
    public class ListeningPassageAppService : EnglishLearningAppAppService, IListeningPassageAppService
    {
        private readonly IRepository<ListeningPassage, Guid> _passageRepo;
        private readonly IRepository<ListeningQuestion, Guid> _questionRepo;
        private readonly IRepository<Chapter, Guid> _chapterRepo;
        private readonly IAudioGenerationService _audioService;
        private readonly IFusionCache _cache;
        public ListeningPassageAppService(
            IRepository<ListeningPassage, Guid> passageRepo,
            IRepository<ListeningQuestion, Guid> questionRepo,
            IRepository<Chapter, Guid> chapterRepo,
            IAudioGenerationService audioService,
            IFusionCache cache)
        {
            _passageRepo = passageRepo;
            _questionRepo = questionRepo;
            _chapterRepo = chapterRepo;
            _audioService = audioService;
            _cache = cache;
        }

        // ================= ADMIN =================

        [Authorize(EnglishLearningAppPermissions.ContentManagement.View)]
        public async Task<List<ListeningPassageDto>> GetListByLevelAsync(Guid levelId)
        {
            var chapterQueryable = await _chapterRepo.GetQueryableAsync();
            var chapterIds = await AsyncExecuter.ToListAsync(
                chapterQueryable
                    .Where(x => x.LevelId == levelId)
                    .Select(x => x.Id));

            if (!chapterIds.Any())
            {
                return new List<ListeningPassageDto>();
            }

            var passageQueryable = await _passageRepo.GetQueryableAsync();
            var passages = await AsyncExecuter.ToListAsync(
                passageQueryable
                    .Where(x => chapterIds.Contains(x.ChapterId))
                    .OrderBy(x => x.Title));

            if (!passages.Any())
            {
                return new List<ListeningPassageDto>();
            }

            return await BuildDtoListAsync(passages);
        }


        [Authorize(EnglishLearningAppPermissions.ContentManagement.View)]
        public async Task<List<ListeningPassageDto>> GetListByChapterAsync(Guid chapterId)
        {
            var passageQueryable = await _passageRepo.GetQueryableAsync();
            var passages = await AsyncExecuter.ToListAsync(
                passageQueryable
                    .Where(x => x.ChapterId == chapterId)
                    .OrderBy(x => x.Title));

            var items = new List<ListeningPassageDto>();
            foreach (var passage in passages)
            {
                items.Add(await BuildDtoAsync(passage));
            }

            return items;
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        [CustomRateLimit(3, 0.0017)]
        public async Task<ListeningPassageDto> CreateAsync(CreateUpdateListeningPassageDto input)
        {
            var passageQueryable = await _passageRepo.GetQueryableAsync();
            var existed = await AsyncExecuter.FirstOrDefaultAsync(
                passageQueryable.Where(x => x.ChapterId == input.ChapterId));
            if (existed != null)
            {
                throw new UserFriendlyException(L["ChapterAlreadyHasListeningPassage"]);
            }
            if (string.IsNullOrWhiteSpace(input.AudioUrl))
            {
                input.AudioUrl = await _audioService.GenerateAudioUrlAsync(input.Transcript);
            }

            var passage = new ListeningPassage(
                GuidGenerator.Create(), input.ChapterId, input.Transcript, input.AudioUrl, input.Title);
            await _passageRepo.InsertAsync(passage);

            var questions = BuildQuestions(input.Questions, passage.Id);
            await _questionRepo.InsertManyAsync(questions);

            await _cache.RemoveByTagAsync($"chapter:{passage.ChapterId}");
            return await BuildDtoAsync(passage);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Create)]
        [CustomRateLimit(3, 0.0017)]
        public async Task<List<ListeningPassageDto>> CreateManyAsync(List<CreateUpdateListeningPassageDto> inputs)
        {
            if (inputs == null || !inputs.Any())
            {
                throw new UserFriendlyException(L["ImportListCannotBeEmpty"]);
            }

            // Validate: không cho ChapterId trùng trong danh sách input
            var inputChapterIds = inputs.Select(x => x.ChapterId).ToList();
            var duplicateCount = inputChapterIds.Count - inputChapterIds.Distinct().Count();
            if (duplicateCount > 0)
            {
                throw new UserFriendlyException(L["DuplicateChapterIdInListeningPassage"]);
            }

            // Validate: check ChapterId đã có Passage trong DB chưa (unique constraint)
            var passageQueryable = await _passageRepo.GetQueryableAsync();
            var existingChapterIds = await AsyncExecuter.ToListAsync(
                passageQueryable.Where(x => inputChapterIds.Contains(x.ChapterId)).Select(x => x.ChapterId));

            if (existingChapterIds.Any())
            {
                var duplicateChapterId = existingChapterIds.First();
                throw new UserFriendlyException(L["ListeningPassageAlreadyExistsForChapter", duplicateChapterId.ToString()]);
            }

            // Tự sinh audio cho Passage nào thiếu AudioUrl (song song, giống CreateManyAsync của SentenceExercise)
            await Task.WhenAll(inputs
                .Where(x => string.IsNullOrWhiteSpace(x.AudioUrl))
                .Select(async x => x.AudioUrl = await _audioService.GenerateAudioUrlAsync(x.Transcript)));

            var passages = new List<ListeningPassage>();
            var allQuestions = new List<ListeningQuestion>();

            foreach (var input in inputs)
            {
                var passage = new ListeningPassage(
                    GuidGenerator.Create(), input.ChapterId, input.Transcript, input.AudioUrl, input.Title);

                passages.Add(passage);

                var questions = BuildQuestions(input.Questions, passage.Id);
                allQuestions.AddRange(questions);
            }

            await _passageRepo.InsertManyAsync(passages);
            await _questionRepo.InsertManyAsync(allQuestions);
            foreach (var chapterId in passages.Select(p => p.ChapterId).Distinct())
            {
                await _cache.RemoveByTagAsync($"chapter:{chapterId}");
            }

            // Build DTO trả về - Questions đã có sẵn trong allQuestions, không cần query lại DB
            var resultDtos = ObjectMapper.Map<List<ListeningPassage>, List<ListeningPassageDto>>(passages);

            foreach (var dto in resultDtos)
            {
                dto.Questions = allQuestions
                    .Where(q => q.PassageId == dto.Id)
                    .OrderBy(q => q.OrderIndex)
                    .Select(q => ObjectMapper.Map<ListeningQuestion, ListeningQuestionDto>(q))
                    .ToList();
            }

            return resultDtos;
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<ListeningPassageDto> UpdateAsync(Guid id, CreateUpdateListeningPassageDto input)
        {
            var passage = await _passageRepo.GetAsync(id);
            passage.Title = input.Title;
            passage.Transcript = input.Transcript;
            passage.AudioUrl = input.AudioUrl;
            await _passageRepo.UpdateAsync(passage);

            await _questionRepo.DeleteAsync(x => x.PassageId == id);
            var questions = BuildQuestions(input.Questions, passage.Id);
            await _questionRepo.InsertManyAsync(questions);

            await _cache.RemoveByTagAsync($"chapter:{passage.ChapterId}");
            return await BuildDtoAsync(passage);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.View)]
        public async Task<ListeningPassageDto> GetForAdminAsync(Guid id)
        {
            var passage = await _passageRepo.GetAsync(id);
            return await BuildDtoAsync(passage);
        }
        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid id)
        {
            var passage = await _passageRepo.GetAsync(id); // lấy trước khi xóa để biết ChapterId cho invalidate
            await _questionRepo.DeleteAsync(x => x.PassageId == id);
            await _passageRepo.DeleteAsync(id);

            await _cache.RemoveByTagAsync($"chapter:{passage.ChapterId}");
        }

        // ================= CLIENT =================

        [AllowAnonymous]
        public async Task<ListeningPassageClientDto> GetForLearnerAsync(Guid chapterId)
        {
            var cacheKey = $"listening:for-learner:{chapterId}";
            return await _cache.GetOrSetAsync(cacheKey, async _ =>
            {
                var passageQueryable = await _passageRepo.GetQueryableAsync();
                var passage = await AsyncExecuter.FirstOrDefaultAsync(
                    passageQueryable.Where(x => x.ChapterId == chapterId));
                if (passage == null)
                {
                    throw new UserFriendlyException(L["ChapterHasNoListeningPassage"]);
                }

                var questionQueryable = await _questionRepo.GetQueryableAsync();
                var questions = await AsyncExecuter.ToListAsync(
                    questionQueryable.Where(x => x.PassageId == passage.Id).OrderBy(x => x.OrderIndex));

                var dto = ObjectMapper.Map<ListeningPassage, ListeningPassageClientDto>(passage);
                dto.Questions = questions.Select(q => ObjectMapper.Map<ListeningQuestion, ListeningQuestionClientDto>(q)).ToList();
                return dto;
            }, tags: new[] { $"chapter:{chapterId}" });
        }

        // ================= PRIVATE =================

        private List<ListeningQuestion> BuildQuestions(List<CreateUpdateListeningQuestionDto> inputs, Guid passageId)
        {
            foreach (var q in inputs)
            {
                if (q.QuestionType == ListeningQuestionType.MultipleChoice && string.IsNullOrWhiteSpace(q.CorrectOptionKey))
                {
                    throw new UserFriendlyException(L["CorrectOptionKeyRequiredForMultipleChoice"]);
                }
            }

            return inputs.Select(q => new ListeningQuestion(
                GuidGenerator.Create(), passageId, q.QuestionType, q.QuestionText,
                q.OrderIndex, q.OptionA, q.OptionB, q.OptionC, q.OptionD, q.CorrectOptionKey)).ToList();
        }

        private async Task<ListeningPassageDto> BuildDtoAsync(ListeningPassage passage)
        {
            var questionQueryable = await _questionRepo.GetQueryableAsync();
            var questions = await AsyncExecuter.ToListAsync(
                questionQueryable.Where(x => x.PassageId == passage.Id).OrderBy(x => x.OrderIndex));

            var dto = ObjectMapper.Map<ListeningPassage, ListeningPassageDto>(passage);
            dto.Questions = questions.Select(q => ObjectMapper.Map<ListeningQuestion, ListeningQuestionDto>(q)).ToList();
            return dto;
        }
        // Dùng chung cho mọi chỗ cần build nhiều ListeningPassageDto cùng lúc
        private async Task<List<ListeningPassageDto>> BuildDtoListAsync(List<ListeningPassage> passages)
        {
            var passageIds = passages.Select(p => p.Id).ToList();

            var questionQueryable = await _questionRepo.GetQueryableAsync();
            var allQuestions = await AsyncExecuter.ToListAsync(
                questionQueryable
                    .Where(x => passageIds.Contains(x.PassageId))
                    .OrderBy(x => x.OrderIndex));

            // Group trong RAM thay vì query lại DB cho từng passage
            var questionsByPassage = allQuestions
                .GroupBy(q => q.PassageId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var items = new List<ListeningPassageDto>();
            foreach (var passage in passages)
            {
                var dto = ObjectMapper.Map<ListeningPassage, ListeningPassageDto>(passage);
                var questions = questionsByPassage.TryGetValue(passage.Id, out var qs)
                    ? qs
                    : new List<ListeningQuestion>();
                dto.Questions = questions.Select(q => ObjectMapper.Map<ListeningQuestion, ListeningQuestionDto>(q)).ToList();
                items.Add(dto);
            }

            return items;
        }
    }
}
