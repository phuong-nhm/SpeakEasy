using EnglishLearningApp.Dtos.Listenings;
using Microsoft.AspNetCore.Authorization;

namespace EnglishLearningApp.Services.Listenings
{
    public interface IListeningPassageAppService
    {
        Task<ListeningPassageDto> CreateAsync(CreateUpdateListeningPassageDto input);
        Task<ListeningPassageDto> UpdateAsync(Guid id, CreateUpdateListeningPassageDto input);
        Task<ListeningPassageDto> GetForAdminAsync(Guid id);
        Task DeleteAsync(Guid id);

        [AllowAnonymous]
        Task<ListeningPassageClientDto> GetForLearnerAsync(Guid chapterId);
    }
}
