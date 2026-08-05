using EnglishLearningApp.Entities.Content;
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

    // Nhóm Writing
    public DbSet<WritingTopic> WritingTopics { get; set; }
    public DbSet<UserWriting> UserWritings { get; set; }

    // Nhóm Progress
    public DbSet<UserProgress> UserProgresses { get; set; }
    public DbSet<UserLessonReview> UserLessonReviews { get; set; }

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

            // 1 Chapter - nhiều Lesson
            b.HasMany(x => x.Lessons)
                .WithOne(x => x.Chapter)
                .HasForeignKey(x => x.ChapterId)
                .IsRequired();
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
