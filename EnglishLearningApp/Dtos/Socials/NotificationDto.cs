using EnglishLearningApp.Entities;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Socials
{
    public class NotificationDto : EntityDto<Guid>
    {
        public NotificationType Type { get; set; }
        public string Content { get; set; }
        public Guid? RelatedEntityId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreationTime { get; set; }
    }
}
