using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishLearningApp.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLessonPartProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppUserLessonPartProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LessonId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsVocabularyCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsGrammarCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsComprehensiveCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppUserLessonPartProgresses", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppUserLessonPartProgresses_UserId_LessonId",
                table: "AppUserLessonPartProgresses",
                columns: new[] { "UserId", "LessonId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppUserLessonPartProgresses");
        }
    }
}
