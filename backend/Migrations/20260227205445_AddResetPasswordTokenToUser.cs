using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApplicationTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddResetPasswordTokenToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResetPasswordToken",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResetPasswordTokenExpires",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResetPasswordToken",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ResetPasswordTokenExpires",
                table: "AspNetUsers");
        }
    }
}
