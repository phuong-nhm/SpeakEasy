using System;
using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Writings
{
    public class GetUserWritingListInput : PagedAndSortedResultRequestDto
    {
        public Guid? UserId { get; set; }
        public Guid? TopicId { get; set; }
    }
}