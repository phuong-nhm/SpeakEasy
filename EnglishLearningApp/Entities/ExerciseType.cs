namespace EnglishLearningApp.Entities
{
    public enum ExerciseType
    {
        WordOrder = 0,             // Ghép câu từ các từ xáo trộn (dạng đang có)
        FillInBlank = 1,           // Điền từ khuyết trong câu
        AnswerQuestion = 2,        // Trả lời 1 câu hỏi bằng câu hoàn chỉnh
        TranslateFromVietnamese = 3, // Ghép câu tiếng Anh từ gợi ý câu tiếng Việt
        ListenChoose = 4             // Nghe rồi chọn đúng câu vừa nghe (bước A trong Dialogue)
    }
}
