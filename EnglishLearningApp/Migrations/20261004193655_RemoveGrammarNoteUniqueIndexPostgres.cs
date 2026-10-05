using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishLearningApp.Migrations
{
    /// <inheritdoc />
    public partial class RemoveGrammarNoteUniqueIndexPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppGrammarNotes_LessonId",
                table: "AppGrammarNotes");

            migrationBuilder.CreateIndex(
                name: "IX_AppGrammarNotes_LessonId",
                table: "AppGrammarNotes",
                column: "LessonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppGrammarNotes_LessonId",
                table: "AppGrammarNotes");

            migrationBuilder.CreateIndex(
                name: "IX_AppGrammarNotes_LessonId",
                table: "AppGrammarNotes",
                column: "LessonId",
                unique: true);
        }
    }
}
