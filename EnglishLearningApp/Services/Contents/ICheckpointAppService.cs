using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Contents
{
    public interface ICheckpointAppService : IApplicationService
    {
        Task<List<CheckpointQuestionDto>> GetCheckpointQuestionsAsync(Guid chapterId, int count);
    }
}
