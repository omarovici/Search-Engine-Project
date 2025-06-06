﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Search_Engine.Models;

#nullable disable

namespace Search_Engine.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20250503214727_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Search_Engine.Models.UrlInfo", b =>
                {
                    b.Property<int>("URL_Num")
                        .HasColumnType("int");

                    b.Property<string>("URL")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("URL_Num");

                    b.ToTable("UrlInfos");
                });

            modelBuilder.Entity("Search_Engine.Models.WordInfo", b =>
                {
                    b.Property<int>("Count")
                        .HasColumnType("int");

                    b.Property<double>("PageRank")
                        .HasColumnType("float");

                    b.Property<int>("URL_Num")
                        .HasColumnType("int");

                    b.Property<string>("Word")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasIndex("URL_Num");

                    b.ToTable("WordInfos");
                });

            modelBuilder.Entity("Search_Engine.Models.WordInfo", b =>
                {
                    b.HasOne("Search_Engine.Models.UrlInfo", "UrlInfo")
                        .WithMany()
                        .HasForeignKey("URL_Num")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("UrlInfo");
                });
#pragma warning restore 612, 618
        }
    }
}
