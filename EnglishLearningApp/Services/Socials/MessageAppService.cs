using EnglishLearningApp.Dtos.Socials;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Social;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EnglishLearningApp.Services.Socials
{
    public class MessageAppService : EnglishLearningAppAppService, IMessageAppService
    {
        private readonly IRepository<Message, Guid> _messageRepo;
        private readonly IRepository<Friendship, Guid> _friendshipRepo;
        private readonly IRepository<Notification, Guid> _notificationRepo;

        public MessageAppService(
            IRepository<Message, Guid> messageRepo,
            IRepository<Friendship, Guid> friendshipRepo,
            IRepository<Notification, Guid> notificationRepo)
        {
            _messageRepo = messageRepo;
            _friendshipRepo = friendshipRepo;
            _notificationRepo = notificationRepo;
        }

        public async Task<MessageDto> SendAsync(SendMessageDto input)
        {
            var currentUserId = CurrentUser.GetId();

            // chỉ cho nhắn tin giữa bạn bè đã Accepted
            var friendshipQueryable = await _friendshipRepo.GetQueryableAsync();
            var isFriend = await AsyncExecuter.AnyAsync(friendshipQueryable.Where(x =>
                x.Status == FriendshipStatus.Accepted &&
                ((x.RequesterId == currentUserId && x.AddresseeId == input.ReceiverId) ||
                 (x.RequesterId == input.ReceiverId && x.AddresseeId == currentUserId))));

            if (!isFriend)
            {
                throw new UserFriendlyException(L["CanOnlyMessageFriends"]);
            }

            var message = new Message(GuidGenerator.Create(), currentUserId, input.ReceiverId, input.Content);
            await _messageRepo.InsertAsync(message);

            await _notificationRepo.InsertAsync(new Notification(
                GuidGenerator.Create(), input.ReceiverId, NotificationType.NewMessage,
                L["NotificationNewMessageContent"], message.Id));

            return ObjectMapper.Map<Message, MessageDto>(message);
        }

        // Lấy toàn bộ tin nhắn giữa mình và 1 người, sắp theo thời gian, đánh dấu đã đọc luôn
        public async Task<List<MessageDto>> GetConversationAsync(Guid otherUserId)
        {
            var currentUserId = CurrentUser.GetId();
            var queryable = await _messageRepo.GetQueryableAsync();
            var messages = await AsyncExecuter.ToListAsync(queryable
                .Where(x =>
                    (x.SenderId == currentUserId && x.ReceiverId == otherUserId) ||
                    (x.SenderId == otherUserId && x.ReceiverId == currentUserId))
                .OrderBy(x => x.CreationTime));

            var unread = messages.Where(x => x.ReceiverId == currentUserId && !x.IsRead).ToList();
            foreach (var m in unread)
            {
                m.MarkAsRead();
                await _messageRepo.UpdateAsync(m);
            }

            return ObjectMapper.Map<List<Message>, List<MessageDto>>(messages);
        }
    }
}
