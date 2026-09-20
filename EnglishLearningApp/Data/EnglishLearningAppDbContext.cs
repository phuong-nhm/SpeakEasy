using EnglishLearningApp.Entities.Content;
using EnglishLearningApp.Entities.Listening;
using EnglishLearningApp.Entities.Progress;
using EnglishLearningApp.Entities.Writing;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement.EntityFrameworkCore;

namespace EnglishLearningApp.Data;

public class EnglishLearningAppDbContext : AbpDbContext<EnglishLearningAppDbContext>
{
    // Nhóm nội dung học
    public DbSet<Level> Levels { get; set; }
    public DbSet<Chapter> Chapters { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Vocabulary> Vocabularies { get; set; }
    public DbSet<SentenceExercise> SentenceExercises { get; set; }
    public DbSet<ListeningPassage> ListeningPassages { get; set; }
    public DbSet<ListeningQuestion> ListeningQuestions { get; set; }
    public DbSet<UserListeningAnswer> UserListeningAnswers { get; set; }
    // Nhóm Writing
    public DbSet<WritingTopic> WritingTopics { get; set; }
    public DbSet<UserWriting> UserWritings { get; set; }

    // Nhóm Progress
    public DbSet<UserProgress> UserProgresses { get; set; }
    public DbSet<UserLessonReview> UserLessonReviews { get; set; }
    public DbSet<GrammarNote> GrammarNotes { get; set; }
    public DbSet<GrammarStructureItem> GrammarStructureItems { get; set; }
    public EnglishLearningAppDbContext(DbContextOptions<EnglishLearningAppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureAuditLogging();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureFeatureManagement();
        builder.ConfigureTenantManagement();

        /* Configure your own entities here */
        builder.Entity<Level>(b =>
        {
            b.ToTable("AppLevels");
            b.Property(x => x.Name).HasMaxLength(64).IsRequired();

            // 1 Level - nhiều Chapter
            b.HasMany(x => x.Chapters)
                .WithOne(x => x.Level)
                .HasForeignKey(x => x.LevelId)
                .IsRequired();
        });

        builder.Entity<Chapter>(b =>
        {
            b.ToTable("AppChapters");
            b.Property(x => x.Title).HasMaxLength(128).IsRequired();

            b.HasMany(x => x.Lessons)
                .WithOne(x => x.Chapter)
                .HasForeignKey(x => x.ChapterId)
                .IsRequired();

            // Thêm mới: 1 Chapter - 1 ListeningPassage (optional, không bắt buộc phải có)
            b.HasOne(x => x.ListeningPassage)
                .WithOne(x => x.Chapter)
                .HasForeignKey<ListeningPassage>(x => x.ChapterId);
        });

        builder.Entity<Lesson>(b =>
        {
            b.ToTable("AppLessons");
            b.Property(x => x.Title).HasMaxLength(128).IsRequired();

            // 1 Lesson - nhiều Vocabulary
            b.HasMany(x => x.Vocabularies)
                .WithOne(x => x.Lesson)
                .HasForeignKey(x => x.LessonId)
                .IsRequired();

            // 1 Lesson - nhiều SentenceExercise
            b.HasMany(x => x.SentenceExercises)
                .WithOne(x => x.Lesson)
                .HasForeignKey(x => x.LessonId)
                .IsRequired();
        });
        builder.Entity<GrammarNote>(b =>
        {
            b.ToTable("AppGrammarNotes");
            b.Property(x => x.Title).HasMaxLength(128).IsRequired();
            b.HasIndex(x => x.LessonId).IsUnique(); // Mỗi Lesson chỉ 1 GrammarNote

            b.HasOne(x => x.Lesson)
                .WithOne()
                .HasForeignKey<GrammarNote>(x => x.LessonId);

            b.HasMany(x => x.Structures)
                .WithOne(x => x.GrammarNote)
                .HasForeignKey(x => x.GrammarNoteId)
                .IsRequired();
        });

        builder.Entity<GrammarStructureItem>(b =>
        {
            b.ToTable("AppGrammarStructureItems");
            b.Property(x => x.Formula).HasMaxLength(256).IsRequired();
        });
        builder.Entity<Vocabulary>(b =>
        {
            b.ToTable("AppVocabularies");
            b.Property(x => x.Word).HasMaxLength(128).IsRequired();
            b.Property(x => x.Meaning).HasMaxLength(256).IsRequired();
        });

        builder.Entity<SentenceExercise>(b =>
        {
            b.ToTable("AppSentenceExercises");
            b.Property(x => x.CorrectSentence).HasMaxLength(512).IsRequired();
        });
        builder.Entity<ListeningPassage>(b =>
        {
            b.ToTable("AppListeningPassages");
            b.Property(x => x.Transcript).IsRequired();
            b.HasIndex(x => x.ChapterId).IsUnique(); // Mỗi Chapter chỉ có 1 Passage

            // 1 Passage - nhiều Question
            b.HasMany(x => x.Questions)
                .WithOne(x => x.Passage)
                .HasForeignKey(x => x.PassageId)
                .IsRequired();
        });

        builder.Entity<ListeningQuestion>(b =>
        {
            b.ToTable("AppListeningQuestions");
            b.Property(x => x.QuestionText).IsRequired();
        });

        builder.Entity<UserListeningAnswer>(b =>
        {
            b.ToTable("AppUserListeningAnswers");
        });
        builder.Entity<WritingTopic>(b =>
        {
            b.ToTable("AppWritingTopics");
            b.Property(x => x.PromptTitle).HasMaxLength(256).IsRequired();
        });

        builder.Entity<UserWriting>(b =>
        {
            b.ToTable("AppUserWritings");
            b.Property(x => x.UserContent).IsRequired();
        });

        builder.Entity<UserProgress>(b =>
        {
            b.ToTable("AppUserProgresses");
            // Mỗi user chỉ có 1 dòng progress cho 1 lesson
            b.HasIndex(x => new { x.UserId, x.LessonId }).IsUnique();
        });

        builder.Entity<UserLessonReview>(b =>
        {
            b.ToTable("AppUserLessonReviews");
            b.HasIndex(x => new { x.UserId, x.LessonId }).IsUnique();
            // Query "bài nào đến hạn ôn tập" sẽ dùng cột này liên tục -> nên có index
            b.HasIndex(x => x.NextReviewTime);
        });
    }
}
