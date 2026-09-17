using EnglishLearningApp.Dtos.Listenings;

namespace EnglishLearningApp.Services.Listenings
{
    public interface IUserListeningAnswerAppService
    {
        Task<ListeningMcqResultDto> SubmitMultipleChoiceAsync(SubmitListeningMcqDto input);
        Task<ListeningEssayResultDto> SubmitEssayAsync(SubmitListeningEssayDto input);
    }
}
