using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishLearningApp.Migrations
{
    /// <inheritdoc />
    public partial class AddListeningFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DialogueGroupId",
                table: "AppSentenceExercises",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DistractorSentence",
                table: "AppSentenceExercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "OrderInGroup",
                table: "AppSentenceExercises",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AppListeningPassages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChapterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transcript = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppListeningPassages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppListeningPassages_AppChapters_ChapterId",
                        column: x => x.ChapterId,
                        principalTable: "AppChapters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppUserListeningAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SelectedOptionKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: true),
                    UserContent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AiFeedbackJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppUserListeningAnswers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppListeningQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PassageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionType = table.Column<int>(type: "int", nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionA = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionB = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionC = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionD = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CorrectOptionKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppListeningQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppListeningQuestions_AppListeningPassages_PassageId",
                        column: x => x.PassageId,
                        principalTable: "AppListeningPassages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppListeningPassages_ChapterId",
                table: "AppListeningPassages",
                column: "ChapterId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppListeningQuestions_PassageId",
                table: "AppListeningQuestions",
                column: "PassageId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppListeningQuestions");

            migrationBuilder.DropTable(
                name: "AppUserListeningAnswers");

            migrationBuilder.DropTable(
                name: "AppListeningPassages");

            migrationBuilder.DropColumn(
                name: "DialogueGroupId",
                table: "AppSentenceExercises");

            migrationBuilder.DropColumn(
                name: "DistractorSentence",
                table: "AppSentenceExercises");

            migrationBuilder.DropColumn(
                name: "OrderInGroup",
                table: "AppSentenceExercises");
        }
    }
}
