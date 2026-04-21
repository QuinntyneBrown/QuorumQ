using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuorumQ.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAverageRatingToRestaurant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AverageRating",
                table: "Restaurants",
                type: "REAL",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AverageRating",
                table: "Restaurants");
        }
    }
}
