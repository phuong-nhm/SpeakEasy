using EnglishLearningApp.Dtos.Socials;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Social;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.Users;

namespace EnglishLearningApp.Services.Socials
{
    public class FriendshipAppService : EnglishLearningAppAppService, IFriendshipAppService
    {
        private readonly IRepository<Friendship, Guid> _friendshipRepo;
        private readonly IRepository<Notification, Guid> _notificationRepo;
        private readonly IIdentityUserRepository _userRepo; // lấy UserName để trả về FriendDto

        public FriendshipAppService(
            IRepository<Friendship, Guid> friendshipRepo,
            IRepository<Notification, Guid> notificationRepo,
            IIdentityUserRepository userRepo)
        {
            _friendshipRepo = friendshipRepo;
            _notificationRepo = notificationRepo;
            _userRepo = userRepo;
        }

        // Gửi lời mời kết bạn
        public async Task<FriendshipDto> SendRequestAsync(Guid addresseeId)
        {
            var currentUserId = CurrentUser.GetId();
            if (currentUserId == addresseeId)
            {
                throw new UserFriendlyException(L["CannotFriendYourself"]);
            }

            var queryable = await _friendshipRepo.GetQueryableAsync();
            var existed = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(x =>
                (x.RequesterId == currentUserId && x.AddresseeId == addresseeId) ||
                (x.RequesterId == addresseeId && x.AddresseeId == currentUserId)));

            if (existed != null)
            {
                throw new UserFriendlyException(L["FriendshipAlreadyExists"]);
            }

            var friendship = new Friendship(GuidGenerator.Create(), currentUserId, addresseeId);
            await _friendshipRepo.InsertAsync(friendship);

            await _notificationRepo.InsertAsync(new Notification(
                GuidGenerator.Create(), addresseeId, NotificationType.FriendRequest,
                L["NotificationFriendRequestContent"], friendship.Id));

            return ObjectMapper.Map<Friendship, FriendshipDto>(friendship);
        }

        // Chấp nhận lời mời - chỉ Addressee mới được chấp nhận
        public async Task AcceptAsync(Guid friendshipId)
        {
            var friendship = await _friendshipRepo.GetAsync(friendshipId);
            if (friendship.AddresseeId != CurrentUser.GetId())
            {
                throw new UserFriendlyException(L["NotAllowedToRespondThisRequest"]);
            }

            friendship.Accept();
            await _friendshipRepo.UpdateAsync(friendship);

            await _notificationRepo.InsertAsync(new Notification(
                GuidGenerator.Create(), friendship.RequesterId, NotificationType.FriendAccepted,
                L["NotificationFriendAcceptedContent"], friendship.Id));
        }

        public async Task DeclineAsync(Guid friendshipId)
        {
            var friendship = await _friendshipRepo.GetAsync(friendshipId);
            if (friendship.AddresseeId != CurrentUser.GetId())
            {
                throw new UserFriendlyException(L["NotAllowedToRespondThisRequest"]);
            }

            friendship.Decline();
            await _friendshipRepo.UpdateAsync(friendship);
        }

        // Danh sách bạn bè đã Accepted (2 chiều) + kèm UserName
        public async Task<List<FriendDto>> GetMyFriendsAsync()
        {
            var currentUserId = CurrentUser.GetId();
            var queryable = await _friendshipRepo.GetQueryableAsync();
            var friendships = await AsyncExecuter.ToListAsync(queryable.Where(x =>
                x.Status == FriendshipStatus.Accepted &&
                (x.RequesterId == currentUserId || x.AddresseeId == currentUserId)));

            var result = new List<FriendDto>();
            foreach (var f in friendships)
            {
                var friendUserId = f.RequesterId == currentUserId ? f.AddresseeId : f.RequesterId;
                var friendUser = await _userRepo.FindAsync(friendUserId);
                result.Add(new FriendDto
                {
                    FriendshipId = f.Id,
                    FriendUserId = friendUserId,
                    FriendUserName = friendUser?.UserName,
                    Status = f.Status
                });
            }
            return result;
        }

        // Danh sách lời mời đang chờ mình phản hồi
        public async Task<List<FriendDto>> GetPendingRequestsAsync()
        {
            var currentUserId = CurrentUser.GetId();
            var queryable = await _friendshipRepo.GetQueryableAsync();
            var pendings = await AsyncExecuter.ToListAsync(queryable.Where(x =>
                x.AddresseeId == currentUserId && x.Status == FriendshipStatus.Pending));

            var result = new List<FriendDto>();
            foreach (var f in pendings)
            {
                var requester = await _userRepo.FindAsync(f.RequesterId);
                result.Add(new FriendDto
                {
                    FriendshipId = f.Id,
                    FriendUserId = f.RequesterId,
                    FriendUserName = requester?.UserName,
                    Status = f.Status
                });
            }
            return result;
        }
    }
}
