using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Users;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Users
{
    public interface IUserAdminAppService : IApplicationService
    {
        Task<PagedResultDto<UserWithRolesDto>> GetListWithRolesAsync(GetUserListWithRolesInput input);
    }
}
