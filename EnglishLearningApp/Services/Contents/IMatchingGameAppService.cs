using System;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Contents;
using Volo.Abp.Application.Services;

namespace EnglishLearningApp.AppServices.Contents
{
    public interface IMatchingGameAppService : IApplicationService
    {
        // Phần 1: game nối từ dùng thẳng từ vựng của Lesson hiện tại
        Task<MatchingGameDto> GetGameForLessonAsync(Guid lessonId);

        // Phần 3: game nối từ tổng hợp - tự quyết định ôn từ bài cũ (nếu có bài đến hạn)
        // hoặc lấy từ bài hiện tại/chương hiện tại (nếu không có gì đến hạn)
        Task<MatchingGameDto> GetGameForSummaryAsync(Guid currentLessonId);

        Task<bool> CheckAnswerAsync(CheckMatchingAnswerDto input);
    }
}
