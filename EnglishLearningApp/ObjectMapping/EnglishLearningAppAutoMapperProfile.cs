using AutoMapper;
using EnglishLearningApp.Dtos.Contents;
using EnglishLearningApp.Dtos.Progresses;
using EnglishLearningApp.Dtos.Writings;
using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Entities.Progress;
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

        // Vocabulary: DTO đọc thường KHÔNG có Distractor -> map bỏ qua field đó tự động
        // (AutoMapper chỉ map field trùng tên, Distractor không có trong VocabularyDto nên tự bỏ)
        CreateMap<Vocabulary, VocabularyDto>();
        CreateMap<CreateUpdateVocabularyDto, Vocabulary>();

        // SentenceExercise: DTO đọc dùng ShuffledWords (tự xử lý tay trong AppService),
        // nên bỏ qua field CorrectSentence khi map Entity -> Dto để không lỡ set nhầm
        CreateMap<SentenceExercise, SentenceExerciseDto>()
            .ForMember(dest => dest.ShuffledWords, opt => opt.Ignore());
        CreateMap<CreateUpdateSentenceExerciseDto, SentenceExercise>();

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
    }
}
