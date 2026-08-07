namespace EnglishLearningApp.Permissions
{
    public static class EnglishLearningAppPermissions
    {
        public const string GroupName = "EnglishLearningApp";

        // Gộp chung 1 nhóm quyền cho toàn bộ Admin CMS (Level/Chapter/Lesson/Vocabulary/
        // SentenceExercise/WritingTopic/MediaUpload) - đơn giản trước, tách nhỏ sau nếu cần
        public static class ContentManagement
        {
            public const string Default = GroupName + ".ContentManagement";
            public const string Create = Default + ".Create";
            public const string Update = Default + ".Update";
            public const string Delete = Default + ".Delete";
        }
    }
}
