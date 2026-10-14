using EnglishLearningApp.Dtos.Agents;
using EnglishLearningApp.Entities;
using EnglishLearningApp.Entities.Agents;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EnglishLearningApp.Services.Agents
{
    public class AgentChatAppService : EnglishLearningAppAppService, IAgentChatAppService
    {
        private readonly IRepository<ChatConversation, Guid> _conversationRepo;
        private readonly IRepository<AgentChatMessage, Guid> _messageRepo;

        public AgentChatAppService(
            IRepository<ChatConversation, Guid> conversationRepo,
            IRepository<AgentChatMessage, Guid> messageRepo)
        {
            _conversationRepo = conversationRepo;
            _messageRepo = messageRepo;
        }

        // Gọi từ FE sau khi 1 lượt hỏi-đáp stream xong (parsed.type === "done"),
        // gọi 2 lần liên tiếp cho message User và message Assistant
        public async Task<AgentChatMessageDto> SaveMessageAsync(SaveChatMessageDto input)
        {
            var currentUserId = CurrentUser.GetId();
            Guid conversationId;

            if (input.ConversationId.HasValue)
            {
                var conversation = await _conversationRepo.GetAsync(input.ConversationId.Value);
                if (conversation.UserId != currentUserId)
                {
                    throw new UserFriendlyException(L["NotAllowedToAccessThisConversation"]);
                }
                conversationId = conversation.Id;
            }
            else
            {
                if (string.IsNullOrWhiteSpace(input.ThreadId))
                {
                    throw new UserFriendlyException(L["ThreadIdRequiredForNewConversation"]);
                }

                var newConversation = new ChatConversation(GuidGenerator.Create(), currentUserId, input.ThreadId);
                // Tự đặt Title theo tin nhắn đầu tiên của User, cắt ngắn 60 ký tự
                if (input.Role == ChatRole.User)
                {
                    newConversation.Title = input.Content.Length > 60
                        ? input.Content.Substring(0, 60) + "..."
                        : input.Content;
                }
                await _conversationRepo.InsertAsync(newConversation);
                conversationId = newConversation.Id;
            }

            var message = new AgentChatMessage(GuidGenerator.Create(), conversationId, input.Role, input.Content);
            await _messageRepo.InsertAsync(message);

            return ObjectMapper.Map<AgentChatMessage, AgentChatMessageDto>(message);
        }

        public async Task<List<ChatConversationDto>> GetMyConversationsAsync()
        {
            var currentUserId = CurrentUser.GetId();
            var queryable = await _conversationRepo.GetQueryableAsync();
            var conversations = await AsyncExecuter.ToListAsync(
                queryable.Where(x => x.UserId == currentUserId).OrderByDescending(x => x.CreationTime));

            return ObjectMapper.Map<List<ChatConversation>, List<ChatConversationDto>>(conversations);
        }

        public async Task<ChatConversationDetailDto> GetConversationDetailAsync(Guid conversationId)
        {
            var conversation = await _conversationRepo.GetAsync(conversationId);
            if (conversation.UserId != CurrentUser.GetId())
            {
                throw new UserFriendlyException(L["NotAllowedToAccessThisConversation"]);
            }

            var messageQueryable = await _messageRepo.GetQueryableAsync();
            var messages = await AsyncExecuter.ToListAsync(
                messageQueryable.Where(x => x.ConversationId == conversationId).OrderBy(x => x.CreationTime));

            var dto = ObjectMapper.Map<ChatConversation, ChatConversationDetailDto>(conversation);
            dto.Messages = ObjectMapper.Map<List<AgentChatMessage>, List<AgentChatMessageDto>>(messages);
            return dto;
        }
    }
}
