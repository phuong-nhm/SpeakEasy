using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Listenings
{
    public class ListeningPassageDto : EntityDto<Guid>
    {
        public Guid ChapterId { get; set; }
        public string Title { get; set; }
        public string Transcript { get; set; }
        public string AudioUrl { get; set; }
        public List<ListeningQuestionDto> Questions { get; set; } = new();
    }

    public class ListeningPassageClientDto : EntityDto<Guid>
    {
        public string Title { get; set; }
        public string AudioUrl { get; set; }
        // Không trả Transcript cho client (tránh user đọc chữ thay vì nghe thật)
        public List<ListeningQuestionClientDto> Questions { get; set; } = new();
    }

    public class CreateUpdateListeningPassageDto
    {
        public Guid ChapterId { get; set; }
        public string Title { get; set; }

        [Required]
        public string Transcript { get; set; }
        public string AudioUrl { get; set; } // null nếu chưa generate TTS

        public List<CreateUpdateListeningQuestionDto> Questions { get; set; } = new();
    }
}
