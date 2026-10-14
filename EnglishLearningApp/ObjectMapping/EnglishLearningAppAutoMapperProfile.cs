using AutoMapper;
using EnglishLearningApp.Dtos.Agents;
using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Dtos.Listenings;
using EnglishLearningApp.Dtos.Progresses;
using EnglishLearningApp.Dtos.Socials;
using EnglishLearningApp.Dtos.Storys;
using EnglishLearningApp.Dtos.Writings;
using EnglishLearningApp.Entities.Agents;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Entities.Listening;
using EnglishLearningApp.Entities.Progress;
using EnglishLearningApp.Entities.Social;
using EnglishLearningApp.Entities.Story;
using EnglishLearningApp.Entities.Writing;

namespace EnglishLearningApp.ObjectMapping;

public class EnglishLearningAppAutoMapperProfile : Profile
{
    public EnglishLearningAppAutoMapperProfile()
    {
        // ===== NHÓM 1: NỘI DUNG HỌC (Content) =====

        CreateMap<Level, LevelDto>();
        CreateMap<CreateUpdateLevelDto, Level>();

        CreateMap<Chapter, ChapterDto>();
        CreateMap<CreateUpdateChapterDto, Chapter>();

        CreateMap<Lesson, LessonDto>();
        CreateMap<CreateUpdateLessonDto, Lesson>();

        CreateMap<Vocabulary, VocabularyDto>();
        CreateMap<CreateUpdateVocabularyDto, Vocabulary>();

        // SentenceExercise: DTO đọc dùng ShuffledWords (tự xử lý tay trong AppService),
        // nên bỏ qua field CorrectSentence khi map Entity -> Dto để không lỡ set nhầm
        CreateMap<SentenceExercise, SentenceExerciseDto>()
            .ForMember(dest => dest.ShuffledWords, opt => opt.Ignore())
                        .ForMember(dest => dest.ListenOptions, opt => opt.Ignore());
        CreateMap<CreateUpdateSentenceExerciseDto, SentenceExercise>();

        // ===== NHÓM: NGỮ PHÁP (Grammar Note) =====

        // GrammarNote: Structures được query + gán tay trong AppService (BuildDtoAsync),
        // nên bỏ qua khi map tự động để không lỡ ghi đè
        CreateMap<GrammarNote, GrammarNoteDto>()
            .ForMember(dest => dest.Structures, opt => opt.Ignore());
        CreateMap<CreateUpdateGrammarNoteDto, GrammarNote>();

        // GrammarStructureItem
        CreateMap<GrammarStructureItem, GrammarStructureItemDto>();
        CreateMap<CreateUpdateGrammarStructureItemDto, GrammarStructureItem>();

        // ===== NHÓM 2: VIẾT AI CHẤM ĐIỂM (Writing) =====

        CreateMap<WritingTopic, WritingTopicDto>();
        CreateMap<CreateUpdateWritingTopicDto, WritingTopic>();

        // UserWriting: field Feedback (AiFeedbackDto) được parse tay từ AiFeedbackJson
        // trong AppService, nên bỏ qua khi map tự động
        CreateMap<UserWriting, UserWritingDto>()
            .ForMember(dest => dest.Feedback, opt => opt.Ignore());
        CreateMap<SubmitWritingDto, UserWriting>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        // ===== NHÓM 3: TIẾN ĐỘ (Progress) =====

        CreateMap<UserProgress, UserProgressDto>();

        CreateMap<UserLessonReview, UserLessonReviewDto>();
        // ===== NHÓM 4: BÀI NGHE (Listening) =====

        // ListeningPassage: Questions được query + gán tay trong AppService (BuildDtoAsync/GetForLearnerAsync),
        // nên bỏ qua khi map tự động để không lỡ ghi đè
        CreateMap<ListeningPassage, ListeningPassageDto>()
            .ForMember(dest => dest.Questions, opt => opt.Ignore());
        CreateMap<ListeningPassage, ListeningPassageClientDto>()
            .ForMember(dest => dest.Questions, opt => opt.Ignore());
        CreateMap<CreateUpdateListeningPassageDto, ListeningPassage>()
            .ForMember(dest => dest.Questions, opt => opt.Ignore()); // Question được tạo riêng bằng BuildQuestions(), không map thẳng

        // ListeningQuestion: 2 DTO khác nhau cho Admin (có CorrectOptionKey) và Client (không có)
        CreateMap<ListeningQuestion, ListeningQuestionDto>();
        CreateMap<ListeningQuestion, ListeningQuestionClientDto>();
        CreateMap<CreateUpdateListeningQuestionDto, ListeningQuestion>();
        // ===== NHÓM 5: TRUYỆN (Story) =====

        // Story: dùng chung cho cả StoryDto và StoryDetailDto (kế thừa StoryDto).
        // AutoMapper không tự map sang lớp con, nên phải khai riêng từng map.
        CreateMap<Story, StoryDto>();
        CreateMap<Story, StoryDetailDto>()
            .ForMember(dest => dest.Segments, opt => opt.Ignore())       // gán tay trong AppService (query riêng theo OrderIndex)
            .ForMember(dest => dest.VocabularyIds, opt => opt.Ignore()); // gán tay trong AppService

        CreateMap<StorySegment, StorySegmentDto>();

        // ===== NHÓM 6: BẠN BÈ, THÔNG BÁO, NHẮN TIN (Social) =====

        CreateMap<Friendship, FriendshipDto>();
        // FriendDto không CreateMap vì build tay trong AppService (cần join thêm UserName từ IdentityUser)

        CreateMap<Notification, NotificationDto>();

        CreateMap<Message, MessageDto>();

        // ===== NHÓM 7: CHUỖI NGÀY HỌC (Streak) =====

        CreateMap<UserStreak, UserStreakDto>();
        // ===== NHÓM 8: XP =====
        // UserXpLog không CreateMap trực tiếp - LeaderboardEntryDto/MyXpSummaryDto đều build tay (SUM/GroupBy), không map 1-1 từ entity

        // ===== NHÓM 9: LỊCH SỬ CHAT AGENT =====
        CreateMap<ChatConversation, ChatConversationDto>();
        CreateMap<ChatConversation, ChatConversationDetailDto>()
            .ForMember(dest => dest.Messages, opt => opt.Ignore()); // gán tay trong AppService

        CreateMap<AgentChatMessage, AgentChatMessageDto>();
    }
}
