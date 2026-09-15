using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using EnglishLearningApp.Dtos.Writings;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Writing;
using EnglishLearningApp.Permissions;
using EnglishLearningApp.Services;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;
using Volo.Abp.Identity;

namespace EnglishLearningApp.AppServices.Writings
{
    [Authorize]
    public class UserWritingAppService : EnglishLearningAppAppService, IUserWritingAppService
    {
        private readonly IRepository<UserWriting, Guid> _writingRepo;
        private readonly IRepository<WritingTopic, Guid> _topicRepo;
        private readonly ICurrentUser _currentUser;
        private readonly IGeminiGradingService _geminiGradingService;
        private readonly IRepository<IdentityUser, Guid> _userRepo;
        public UserWritingAppService(
            IRepository<UserWriting, Guid> writingRepo,
            IRepository<WritingTopic, Guid> topicRepo,
            ICurrentUser currentUser,
            IRepository<IdentityUser, Guid> userRepo,
            IGeminiGradingService geminiGradingService)
        {
            _writingRepo = writingRepo;
            _topicRepo = topicRepo;
            _currentUser = currentUser;
            _userRepo = userRepo;
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

        // ================= ADMIN =================
                [Authorize(EnglishLearningAppPermissions.ContentManagement.View)]
        public async Task<PagedResultDto<UserWritingDto>> GetListForAdminAsync(GetUserWritingListInput input)
        {
            var writingQueryable = await _writingRepo.GetQueryableAsync();
            var topicQueryable = await _topicRepo.GetQueryableAsync();
            var userQueryable = await _userRepo.GetQueryableAsync();

            var query = from w in writingQueryable
                        join t in topicQueryable on w.TopicId equals t.Id
                        join u in userQueryable on w.UserId equals u.Id
                        where (!input.UserId.HasValue || w.UserId == input.UserId)
                              && (!input.TopicId.HasValue || w.TopicId == input.TopicId)
                        orderby w.CreationTime descending
                        select new { Writing = w, TopicTitle = t.PromptTitle, UserName = u.UserName };

            var totalCount = await AsyncExecuter.CountAsync(query);

            var pagedQuery = query.Skip(input.SkipCount).Take(input.MaxResultCount);
            var pageList = await AsyncExecuter.ToListAsync(pagedQuery);

            var result = pageList.Select(x =>
            {
                var dto = MapWithFeedback(x.Writing);
                dto.TopicTitle = x.TopicTitle;
                dto.UserName = x.UserName;
                return dto;
            }).ToList();

            return new PagedResultDto<UserWritingDto>(totalCount, result);
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.View)]
        public async Task<UserWritingDto> GetDetailForAdminAsync(Guid writingId)
        {
            var writing = await _writingRepo.GetAsync(writingId);

            var topic = await _topicRepo.FindAsync(writing.TopicId);
            var user = await _userRepo.FindAsync(writing.UserId);

            var dto = MapWithFeedback(writing);
            dto.TopicTitle = topic?.PromptTitle;
            dto.UserName = user?.UserName;

            return dto;
        }

        [Authorize(EnglishLearningAppPermissions.ContentManagement.Delete)]
        public async Task DeleteAsync(Guid writingId)
        {
            await _writingRepo.DeleteAsync(writingId);
        }

        // ================= PRIVATE =================

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
