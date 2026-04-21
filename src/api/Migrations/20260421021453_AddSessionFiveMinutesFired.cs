using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuorumQ.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionFiveMinutesFired : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "FiveMinutesFired",
                table: "LunchSessions",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FiveMinutesFired",
                table: "LunchSessions");
        }
    }
}
