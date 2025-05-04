using Microsoft.EntityFrameworkCore;

namespace Search_Engine.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<WordInfo> WordInfos { get; set; }
        public DbSet<UrlInfo> UrlInfos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
			modelBuilder.Entity<WordInfo>().HasNoKey();

			modelBuilder.Entity<WordInfo>()
                .HasOne(w => w.UrlInfo)
                .WithMany()
                .HasForeignKey(w => w.URL_Num)
                .HasPrincipalKey(u => u.URL_Num);

		    modelBuilder.Entity<UrlInfo>()
	            .Property(u => u.URL_Num)
	            .ValueGeneratedNever();


		}
    }
}