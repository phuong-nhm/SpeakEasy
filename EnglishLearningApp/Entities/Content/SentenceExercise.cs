using System;
using System.Linq;
using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Content
{
    // Bài tập xếp câu (Grammar) hoặc câu trong phần Review
    public class SentenceExercise : Entity<Guid>
    {
        public Guid LessonId { get; set; }
        public SectionType SectionType { get; set; }
        public string CorrectSentence { get; set; }
        public string AudioUrl { get; set; }

        // ==== Thêm mới cho đa dạng dạng bài ====

        // Mặc định WordOrder để tương thích ngược với data cũ (không cần set tay lại)
        public ExerciseType ExerciseType { get; set; } = ExerciseType.WordOrder;

        // Chỉ dùng cho ExerciseType = AnswerQuestion, các dạng khác để null
        public string PromptText { get; set; }

        // Chỉ dùng cho ExerciseType = TranslateFromVietnamese, các dạng khác để null
        public string VietnameseTranslation { get; set; }
        // ==== Thêm cho Listening Dialogue (Kiểu 1) ====

        // Chỉ dùng cho ExerciseType = ListenChoose: câu sai để tạo 2 lựa chọn khi nghe
        public string DistractorSentence { get; set; }

        // Nối câu A (nghe-chọn) và câu B (dịch-đáp) thành 1 cặp hội thoại. Null nếu không phải dialogue
        public Guid? DialogueGroupId { get; set; }

        // 1 = câu A (người nói, ListenChoose), 2 = câu B (mình đáp, TranslateFromVietnamese)
        public int? OrderInGroup { get; set; }
        // Navigation: trỏ ngược về Lesson cha
        public Lesson Lesson { get; set; }

        protected SentenceExercise() { }

        public SentenceExercise(
            Guid id,
            Guid lessonId,
            SectionType sectionType,
            string correctSentence,
            string audioUrl = null,
            ExerciseType exerciseType = ExerciseType.WordOrder,
            string promptText = null,
            string vietnameseTranslation = null,
            string distractorSentence = null,
            Guid? dialogueGroupId = null,
            int? orderInGroup = null) : base(id)
        {
            LessonId = lessonId;
            SectionType = sectionType;
            CorrectSentence = correctSentence;
            AudioUrl = audioUrl;
            ExerciseType = exerciseType;
            PromptText = promptText;
            VietnameseTranslation = vietnameseTranslation;
            DistractorSentence = distractorSentence;
            DialogueGroupId = dialogueGroupId;
            OrderInGroup = orderInGroup;
        }

        // Xếp block từ bị xáo trộn: tách CorrectSentence lúc runtime, không cần lưu riêng trong DB
        public string[] GetShuffledWords()
        {
            var words = CorrectSentence.Split(' ');
            var random = new Random();
            return words.OrderBy(_ => random.Next()).ToArray();
        }
    }
}