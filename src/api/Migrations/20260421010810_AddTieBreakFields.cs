using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuorumQ.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTieBreakFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TiedSuggestionIds",
                table: "LunchSessions",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TiedSuggestionIds",
                table: "LunchSessions");
        }
    }
}
