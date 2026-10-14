namespace EnglishLearningApp.Entities
{
    public enum LessonType
    {
        Vocabulary = 0,
        Grammar = 1,
        Listening = 2,
        Writing = 3,
        Checkpoint = 4
    }

    public enum SectionType
    {
        Vocabulary = 0,
        Grammar = 1,
        Review = 2,
        Dialogue = 3
    }

    public enum WritingTopicType
    {
        Weekly = 0,
        Monthly = 1
    }
    public enum WordType
    {
        Noun,
        Verb,
        Adjective,
        Adverb,
        Preposition,
        Phrase,
        Other
    }
    public enum StoryGenre { Cartoon, Romance, Adventure, SliceOfLife, Mystery, Fantasy, Other }
    public enum StoryLength { Short, Medium, Long }
    public enum StoryGenerationSource { ByCurrentLevel, ByChosenLevel, ByCustomVocabSet }
    public enum StoryReadStatus { NotStarted, InProgress, Completed }
    public enum FriendshipStatus { Pending, Accepted, Declined, Blocked }
    public enum NotificationType { FriendRequest, FriendAccepted, NewMessage, ReviewDue, StoryReady }
}
