using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Writings;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Writings
{
    public interface IUserWritingAppService : IApplicationService
    {
        Task<UserWritingDto> SubmitWritingAsync(SubmitWritingDto input);
        Task<List<UserWritingDto>> GetHistoryAsync();
        Task<UserWritingDto> GetDetailAsync(Guid writingId);
    }
}
