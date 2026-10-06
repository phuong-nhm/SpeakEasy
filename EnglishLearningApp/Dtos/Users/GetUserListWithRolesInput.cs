using Volo.Abp.Application.Dtos;

namespace EnglishLearningApp.Dtos.Users
{
    public class GetUserListWithRolesInput : PagedAndSortedResultRequestDto
    {
        public string? Filter { get; set; }

        public string? RoleName { get; set; }
    }
}
