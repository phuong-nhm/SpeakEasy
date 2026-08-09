using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishLearningApp.Migrations
{
    /// <inheritdoc />
    public partial class Added_ExerciseType_To_SentenceExercise : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ExerciseType",
                table: "AppSentenceExercises",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PromptText",
                table: "AppSentenceExercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VietnameseTranslation",
                table: "AppSentenceExercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExerciseType",
                table: "AppSentenceExercises");

            migrationBuilder.DropColumn(
                name: "PromptText",
                table: "AppSentenceExercises");

            migrationBuilder.DropColumn(
                name: "VietnameseTranslation",
                table: "AppSentenceExercises");
        }
    }
}
