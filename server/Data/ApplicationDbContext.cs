using ApplicationTracker.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ApplicationTracker.Api.Data;

// Bruker IdentityDbContext i stedet for DbContext — dette gir oss tabeller for brukere, roller osv.
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<User>(options)
{
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<Report> Reports => Set<Report>();

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

            entity.Property(a => a.UserId)
                .HasColumnName("user_id");

            // Relasjon: Hver søknad tilhører én bruker
            entity.HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
