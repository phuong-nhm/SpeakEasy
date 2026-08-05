using System;
using System.Collections.Generic;

namespace EnglishLearningApp.Dtos.Contents
{
    public class MatchingItemDto
    {
        public Guid VocabularyId { get; set; }
        public string Text { get; set; }
    }

    public class MatchingGameDto
    {
        public List<MatchingItemDto> WordColumn { get; set; }
        public List<MatchingItemDto> MeaningColumn { get; set; }
        public bool IsPassiveRecall { get; set; }
        public Guid? SourceLessonId { get; set; }
        public string SourceLessonTitle { get; set; }
    }

    public class MatchingPairAnswerDto
    {
        public Guid WordVocabularyId { get; set; }
        public Guid MeaningVocabularyId { get; set; }
    }

    public class CheckMatchingAnswerDto
    {
        public List<MatchingPairAnswerDto> UserPairs { get; set; }
    }
}
