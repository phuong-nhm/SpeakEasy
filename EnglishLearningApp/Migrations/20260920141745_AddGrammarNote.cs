using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishLearningApp.Migrations
{
    /// <inheritdoc />
    public partial class AddGrammarNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppGrammarNotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LessonId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    UsageNote = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppGrammarNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppGrammarNotes_AppLessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "AppLessons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppGrammarStructureItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GrammarNoteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormType = table.Column<int>(type: "int", nullable: false),
                    Formula = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Example = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppGrammarStructureItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppGrammarStructureItems_AppGrammarNotes_GrammarNoteId",
                        column: x => x.GrammarNoteId,
                        principalTable: "AppGrammarNotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppGrammarNotes_LessonId",
                table: "AppGrammarNotes",
                column: "LessonId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppGrammarStructureItems_GrammarNoteId",
                table: "AppGrammarStructureItems",
                column: "GrammarNoteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppGrammarStructureItems");

            migrationBuilder.DropTable(
                name: "AppGrammarNotes");
        }
    }
}
