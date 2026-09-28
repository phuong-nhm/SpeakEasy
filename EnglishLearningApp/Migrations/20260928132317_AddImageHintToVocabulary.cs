using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishLearningApp.Migrations
{
    /// <inheritdoc />
    public partial class AddImageHintToVocabulary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageHint",
                table: "AppVocabularies",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageHint",
                table: "AppVocabularies");
        }
    }
}
