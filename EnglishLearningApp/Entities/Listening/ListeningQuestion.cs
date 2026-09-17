using Volo.Abp.Domain.Entities;

namespace EnglishLearningApp.Entities.Listening
{
    public class ListeningQuestion : Entity<Guid>
    {
        public Guid PassageId { get; set; }
        public ListeningQuestionType QuestionType { get; set; }
        public string QuestionText { get; set; }

        // Chỉ dùng khi QuestionType = MultipleChoice, để null nếu Essay
        public string OptionA { get; set; }
        public string OptionB { get; set; }
        public string OptionC { get; set; }
        public string OptionD { get; set; }
        public string CorrectOptionKey { get; set; } // "A"/"B"/"C"/"D"

        public int OrderIndex { get; set; }

        public ListeningPassage Passage { get; set; }

        protected ListeningQuestion() { }

        public ListeningQuestion(
            Guid id,
            Guid passageId,
            ListeningQuestionType questionType,
            string questionText,
            int orderIndex,
            string optionA = null,
            string optionB = null,
            string optionC = null,
            string optionD = null,
            string correctOptionKey = null) : base(id)
        {
            PassageId = passageId;
            QuestionType = questionType;
            QuestionText = questionText;
            OrderIndex = orderIndex;
            OptionA = optionA;
            OptionB = optionB;
            OptionC = optionC;
            OptionD = optionD;
            CorrectOptionKey = correctOptionKey;
        }
    }
}
