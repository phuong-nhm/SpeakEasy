using System;
using System.Collections.Generic;

namespace EnglishLearningApp.Dtos.Contents
{
    // Trả về khi user vào học 1 Lesson - gộp cả 3 phần Từ vựng/Ngữ pháp/Tổng hợp trong 1 lần gọi
    public class LessonContentDto
    {
        public LessonDto Lesson { get; set; }
        public List<VocabularyDto> Vocabularies { get; set; }
        public List<SentenceExerciseDto> Sentences { get; set; }
    }

    // Câu hỏi Checkpoint - gộp chung 1 dạng để FE render đồng nhất dù nguồn là Vocabulary hay SentenceExercise
    public class CheckpointQuestionDto
    {
        public Guid SourceId { get; set; } // Id của Vocabulary hoặc SentenceExercise gốc
        public string QuestionType { get; set; } // "Vocabulary" hoặc "Sentence"
        public VocabularyQuizDto VocabularyQuiz { get; set; } // null nếu QuestionType = "Sentence"
        public SentenceExerciseDto SentenceQuiz { get; set; } // null nếu QuestionType = "Vocabulary"
    }
}
