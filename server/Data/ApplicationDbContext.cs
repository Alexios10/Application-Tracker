using ApplicationTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ApplicationTracker.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
        public DbSet<Application> Applications => Set<Application>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
                base.OnModelCreating(modelBuilder);

                modelBuilder.Entity<Application>(entity =>
                {
                        entity.ToTable("applications");
                        entity.HasKey(a => a.Id);

                        entity.Property(a => a.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();

                        entity.Property(a => a.Company)
                    .HasColumnName("company")
                    .IsRequired();

                        entity.Property(a => a.Position)
                    .HasColumnName("position")
                    .IsRequired();

                        entity.Property(a => a.DateSent)
                    .HasColumnName("date_sent");

                        entity.Property(a => a.Status)
                    .HasColumnName("status")
                    .HasConversion<string>();

                        entity.Property(a => a.Note)
                    .HasColumnName("note");
                });
        }
}
