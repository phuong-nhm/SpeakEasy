using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishLearningApp.Migrations
{
    /// <inheritdoc />
    public partial class AddStoryFriendshipMessageStreakXpAgentChat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppAgentChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppAgentChatMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppChatConversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ThreadId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Title = table.Column<string>(type: "text", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppChatConversations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppUserXpLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<int>(type: "integer", nullable: false),
                    Source = table.Column<int>(type: "integer", nullable: false),
                    RelatedEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppUserXpLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppAgentChatMessages_ConversationId",
                table: "AppAgentChatMessages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_AppChatConversations_UserId",
                table: "AppChatConversations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AppUserXpLogs_UserId_CreationTime",
                table: "AppUserXpLogs",
                columns: new[] { "UserId", "CreationTime" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppAgentChatMessages");

            migrationBuilder.DropTable(
                name: "AppChatConversations");

            migrationBuilder.DropTable(
                name: "AppUserXpLogs");
        }
    }
}
