using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Writings;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Writing;
using EnglishLearningApp.Services;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EnglishLearningApp.AppServices.Writings
{
    [Authorize]
    public class UserWritingAppService : EnglishLearningAppAppService, IUserWritingAppService
    {
        private readonly IRepository<UserWriting, Guid> _writingRepo;
        private readonly ICurrentUser _currentUser;
        private readonly IGeminiGradingService _geminiGradingService;

        public UserWritingAppService(
            IRepository<UserWriting, Guid> writingRepo,
            ICurrentUser currentUser,
            IGeminiGradingService geminiGradingService)
        {
            _writingRepo = writingRepo;
            _currentUser = currentUser;
            _geminiGradingService = geminiGradingService;
        }

        public async Task<UserWritingDto> SubmitWritingAsync(SubmitWritingDto input)
        {
            var userId = _currentUser.GetId();

            var feedbackJson = await _geminiGradingService.GradeWritingAsync(input.UserContent);

            var writing = new UserWriting
            (
                GuidGenerator.Create(),
                userId,
                input.TopicId,
                input.UserContent,
                feedbackJson
            );
            await _writingRepo.InsertAsync(writing);

            return MapWithFeedback(writing);
        }

        public async Task<List<UserWritingDto>> GetHistoryAsync()
        {
            var userId = _currentUser.GetId();
            var queryable = await _writingRepo.GetQueryableAsync();
            var query = queryable
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreationTime);

            var list = await AsyncExecuter.ToListAsync(query);
            return list.Select(MapWithFeedback).ToList();
        }

        public async Task<UserWritingDto> GetDetailAsync(Guid writingId)
        {
            var writing = await _writingRepo.GetAsync(writingId);
            return MapWithFeedback(writing);
        }

        private UserWritingDto MapWithFeedback(UserWriting writing)
        {
            var dto = ObjectMapper.Map<UserWriting, UserWritingDto>(writing);
            if (!string.IsNullOrEmpty(writing.AiFeedbackJson))
            {
                dto.Feedback = JsonSerializer.Deserialize<AiFeedbackDto>(
                    writing.AiFeedbackJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            return dto;
        }
    }
}
