using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Socials
{
    public class MessageDto : EntityDto<Guid>
    {
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public string Content { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreationTime { get; set; }
    }

    public class SendMessageDto
    {
        public Guid ReceiverId { get; set; }
        public string Content { get; set; }
    }
}
