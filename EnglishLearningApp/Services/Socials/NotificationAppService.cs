using EnglishLearningApp.Dtos.Socials;
using EnglishLearningApp.Entities.Social;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EnglishLearningApp.Services.Socials
{
    public class NotificationAppService : EnglishLearningAppAppService, INotificationAppService
    {
        private readonly IRepository<Notification, Guid> _notificationRepo;

        public NotificationAppService(IRepository<Notification, Guid> notificationRepo)
        {
            _notificationRepo = notificationRepo;
        }

        public async Task<List<NotificationDto>> GetMyNotificationsAsync(bool unreadOnly = false)
        {
            var currentUserId = CurrentUser.GetId();
            var queryable = await _notificationRepo.GetQueryableAsync();
            var filtered = queryable.Where(x => x.UserId == currentUserId);
            if (unreadOnly)
            {
                filtered = filtered.Where(x => !x.IsRead);
            }

            var notifications = await AsyncExecuter.ToListAsync(
                filtered.OrderByDescending(x => x.CreationTime).Take(50));

            return ObjectMapper.Map<List<Notification>, List<NotificationDto>>(notifications);
        }

        public async Task MarkAsReadAsync(Guid id)
        {
            var notification = await _notificationRepo.GetAsync(id);
            if (notification.UserId != CurrentUser.GetId()) return; // im lặng bỏ qua, không lộ thông tin notification người khác

            notification.MarkAsRead();
            await _notificationRepo.UpdateAsync(notification);
        }
    }
}
