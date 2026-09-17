using EnglishLearningApp.AppServices.Writings;
using EnglishLearningApp.Dtos.Listenings;
using EnglishLearningApp.Entities.Listening;
using System.Text.Json;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EnglishLearningApp.Services.Listenings
{
    public class UserListeningAnswerAppService : EnglishLearningAppAppService, IUserListeningAnswerAppService
    {
        private readonly IRepository<ListeningQuestion, Guid> _questionRepo;
        private readonly IRepository<UserListeningAnswer, Guid> _answerRepo;
        private readonly ICurrentUser _currentUser;
        private readonly IGeminiGradingService _geminiGradingService;

        public UserListeningAnswerAppService(
            IRepository<ListeningQuestion, Guid> questionRepo,
            IRepository<UserListeningAnswer, Guid> answerRepo,
            ICurrentUser currentUser,
            IGeminiGradingService geminiGradingService)
        {
            _questionRepo = questionRepo;
            _answerRepo = answerRepo;
            _currentUser = currentUser;
            _geminiGradingService = geminiGradingService;
        }

        public async Task<ListeningMcqResultDto> SubmitMultipleChoiceAsync(SubmitListeningMcqDto input)
        {
            var question = await _questionRepo.GetAsync(input.QuestionId);

            // Chấm ở server, không tin dữ liệu client gửi lên
            var isCorrect = string.Equals(
                question.CorrectOptionKey, input.SelectedOptionKey, StringComparison.OrdinalIgnoreCase);

            var answer = new UserListeningAnswer(GuidGenerator.Create(), _currentUser.GetId(), input.QuestionId)
            {
                SelectedOptionKey = input.SelectedOptionKey,
                IsCorrect = isCorrect
            };
            await _answerRepo.InsertAsync(answer);

            return new ListeningMcqResultDto { IsCorrect = isCorrect, CorrectOptionKey = question.CorrectOptionKey };
        }

        public async Task<ListeningEssayResultDto> SubmitEssayAsync(SubmitListeningEssayDto input)
        {
            var question = await _questionRepo.GetAsync(input.QuestionId);

            // Tái sử dụng đúng service Gemini đang chấm UserWriting, truyền QuestionText làm ngữ cảnh
            var feedback = await _geminiGradingService.GradeWritingAsync(question.QuestionText, input.UserContent);
            var feedbackJson = JsonSerializer.Serialize(feedback);

            var answer = new UserListeningAnswer(GuidGenerator.Create(), _currentUser.GetId(), input.QuestionId)
            {
                UserContent = input.UserContent,
                AiFeedbackJson = feedbackJson
            };
            await _answerRepo.InsertAsync(answer);

            return new ListeningEssayResultDto { AiFeedback = feedback };
        }
    }
}
