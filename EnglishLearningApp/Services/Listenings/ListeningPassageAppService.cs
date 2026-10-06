using EnglishLearningApp.Dtos.Listenings;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Entities.Listening;
using EnglishLearningApp.Permissions;
using Microsoft.AspNetCore.Authorization;
using EnglishLearningApp.Services;
using EnglishLearningApp.Services.Contents;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace EnglishLearningApp.Services.Listenings
{
    public class ListeningPassageAppService : EnglishLearningAppAppService, IListeningPassageAppService
    {
        private readonly IRepository<ListeningPassage, Guid> _passageRepo;
        private readonly IRepository<ListeningQuestion, Guid> _questionRepo;
        private readonly IRepository<Chapter, Guid> _chapterRepo;
        private readonly IAudioGenerationService _audioService;

        public ListeningPassageAppService(
            IRepository<ListeningPassage, Guid> passageRepo,
            IRepository<ListeningQuestion, Guid> questionRepo,
            IRepository<Chapter, Guid> chapterRepo,
            IAudioGenerationService audioService)
        {
            _passageRepo = passageRepo;
            _questionRepo = questionRepo;
            _chapterRepo = chapterRepo;
            _audioService = audioService;
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

            var items = new List<ListeningPassageDto>();
            foreach (var passage in passages)
            {
                items.Add(await BuildDtoAsync(passage));
            }

            return items;
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

            return await BuildDtoAsync(passage);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Update)]
        public async Task<ListeningPassageDto> UpdateAsync(Guid id, CreateUpdateListeningPassageDto input)
        {
            var passage = await _passageRepo.GetAsync(id);
            passage.Title = input.Title;
            passage.Transcript = input.Transcript;
            passage.AudioUrl = input.AudioUrl;
            await _passageRepo.UpdateAsync(passage);

            // Đơn giản nhất: xoá câu hỏi cũ, tạo lại theo input mới
            await _questionRepo.DeleteAsync(x => x.PassageId == id);
            var questions = BuildQuestions(input.Questions, passage.Id);
            await _questionRepo.InsertManyAsync(questions);

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
            await _questionRepo.DeleteAsync(x => x.PassageId == id);
            await _passageRepo.DeleteAsync(id);
        }

        // ================= CLIENT =================

        [AllowAnonymous]
        public async Task<ListeningPassageClientDto> GetForLearnerAsync(Guid chapterId)
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
    }
}
