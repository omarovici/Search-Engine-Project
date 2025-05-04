using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Search_Engine.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UrlInfos",
                columns: table => new
                {
                    URL_Num = table.Column<int>(type: "int", nullable: false),
                    URL = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UrlInfos", x => x.URL_Num);
                });

            migrationBuilder.CreateTable(
                name: "WordInfos",
                columns: table => new
                {
                    Word = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    URL_Num = table.Column<int>(type: "int", nullable: false),
                    Count = table.Column<int>(type: "int", nullable: false),
                    PageRank = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.ForeignKey(
                        name: "FK_WordInfos_UrlInfos_URL_Num",
                        column: x => x.URL_Num,
                        principalTable: "UrlInfos",
                        principalColumn: "URL_Num",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WordInfos_URL_Num",
                table: "WordInfos",
                column: "URL_Num");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WordInfos");

            migrationBuilder.DropTable(
                name: "UrlInfos");
        }
    }
}
