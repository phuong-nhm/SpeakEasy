using EnglishLearningApp.Dtos.Socials;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.Services.Socials
{
    public interface INotificationAppService: IApplicationService
    {
        Task<List<NotificationDto>> GetMyNotificationsAsync(bool unreadOnly = false);
        Task MarkAsReadAsync(Guid id);
    }
}
