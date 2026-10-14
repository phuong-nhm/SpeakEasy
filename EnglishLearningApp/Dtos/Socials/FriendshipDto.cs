using EnglishLearningApp.Entities;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Socials
{
    public class FriendshipDto : EntityDto<Guid>
    {
        public Guid RequesterId { get; set; }
        public Guid AddresseeId { get; set; }
        public FriendshipStatus Status { get; set; }
        public DateTime? RespondedAt { get; set; }
        public DateTime CreationTime { get; set; }
    }

    // Trả kèm thông tin cơ bản của người bạn (không phải chính user) - map thủ công trong AppService
    public class FriendDto
    {
        public Guid FriendshipId { get; set; }
        public Guid FriendUserId { get; set; }
        public string FriendUserName { get; set; }
        public FriendshipStatus Status { get; set; }
    }
}
