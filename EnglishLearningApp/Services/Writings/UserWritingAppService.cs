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
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EnglishLearningApp.AppServices.Writings
{
    [Authorize]
    public class UserWritingAppService : EnglishLearningAppAppService, IUserWritingAppService
    {
        private readonly IRepository<UserWriting, Guid> _writingRepo;
        private readonly IRepository<WritingTopic, Guid> _topicRepo;
        private readonly ICurrentUser _currentUser;
        private readonly IGeminiGradingService _geminiGradingService;

        public UserWritingAppService(
            IRepository<UserWriting, Guid> writingRepo,
            IRepository<WritingTopic, Guid> topicRepo,
            ICurrentUser currentUser,
            IGeminiGradingService geminiGradingService)
        {
            _writingRepo = writingRepo;
            _topicRepo = topicRepo;
            _currentUser = currentUser;
            _geminiGradingService = geminiGradingService;
        }

        public async Task<UserWritingDto> SubmitWritingAsync(SubmitWritingDto input)
        {
            var userId = _currentUser.GetId();

            // Lấy đề bài để biết PromptTitle - Gemini cần đề bài để chấm đúng ngữ cảnh
            var topic = await _topicRepo.FindAsync(input.TopicId);
            if (topic == null)
            {
                throw new UserFriendlyException(L["TopicNotAvailable"]);
            }

            // GradeWritingAsync trả về object AiFeedbackDto, không phải string
            var feedback = await _geminiGradingService.GradeWritingAsync(topic.PromptTitle, input.UserContent);

            // Entity chỉ lưu string JSON, nên phải serialize lại trước khi lưu DB
            var feedbackJson = JsonSerializer.Serialize(feedback);

            var writing = new UserWriting(
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

            // Chặn user A xem bài viết của user B qua việc đoán Guid
            if (writing.UserId != _currentUser.GetId())
            {
                throw new UserFriendlyException(L["YouCannotAccessThisWriting"]);
            }

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
