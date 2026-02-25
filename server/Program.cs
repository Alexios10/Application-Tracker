using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System;

var builder = WebApplication.CreateBuilder(args);

// In production (e.g. Railway), respect the PORT environment variable if present
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    string connectionString;

    if (!string.IsNullOrEmpty(databaseUrl))
    {
        // Railway provides DATABASE_URL in URI format — convert to Npgsql connection string
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':');
        connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
    }
    else
    {
        connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("No connection string found.");
    }

    options.UseNpgsql(connectionString);
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://application-tracker-five-pi.vercel.app", "http://localhost:8080")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
// Configure JSON options to serialize enums as strings
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Minimal API setup

var app = builder.Build();
app.UseCors();

app.MapGet("/api/applications", async (ApplicationDbContext db) =>
    await db.Applications.OrderByDescending(a => a.DateSent).ToListAsync());

app.MapPost("/api/applications", async (ApplicationDbContext db, Application application) =>
{
    db.Applications.Add(application);
    await db.SaveChangesAsync();
    return Results.Created($"/api/applications/{application.Id}", application);
});

app.MapPut("/api/applications/{id}", async (int id, ApplicationDbContext db, Application updated) =>
{
    var existing = await db.Applications.FindAsync(id);
    if (existing is null)
    {
        return Results.NotFound();
    }

    existing.Company = updated.Company;
    existing.Position = updated.Position;
    existing.DateSent = updated.DateSent;
    existing.Status = updated.Status;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/applications/{id}", async (int id, ApplicationDbContext db) =>
{
    var existing = await db.Applications.FindAsync(id);
    if (existing is null)
    {
        return Results.NotFound();
    }

    db.Applications.Remove(existing);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Apply any pending migrations at startup and seed data if empty
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();

    if (!db.Applications.Any())
    {
        db.Applications.AddRange(
            new Application { Company = "Sopra Steria", Position = "Nyutdannet teknologi", DateSent = "2026-02-04", Status = ApplicationStatus.Avslag },
            new Application { Company = "Vivicta", Position = "Junior ERP/utvikler", DateSent = "2026-02-04", Status = ApplicationStatus.Sendt },
            new Application { Company = "Sporveien", Position = "Integrasjonsutvikler", DateSent = "2026-02-06", Status = ApplicationStatus.Avslag },
            new Application { Company = "Gjensidige", Position = "Utvikler", DateSent = "2026-02-07", Status = ApplicationStatus.Sendt },
            new Application { Company = "Bouvet", Position = "Nyutdannet Utvikler", DateSent = "2026-02-08", Status = ApplicationStatus.Avslag },
            new Application { Company = "NTB", Position = "Frontend/Fullstack-utvikler", DateSent = "2026-02-12", Status = ApplicationStatus.Sendt },
            new Application { Company = "Medic IT", Position = "IT-support", DateSent = "2026-02-12", Status = ApplicationStatus.Sendt },
            new Application { Company = "Entur", Position = "Oppstartsprogram for utviklere", DateSent = "2026-02-13", Status = ApplicationStatus.Sendt },
            new Application { Company = "BankID", Position = "Sommerjobb utvikler", DateSent = "2026-02-13", Status = ApplicationStatus.Sendt },
            new Application { Company = "Academic Work", Position = "IT-student", DateSent = "2026-02-13", Status = ApplicationStatus.Sendt },
            new Application { Company = "Tolletaten", Position = "Sommer jobb IT", DateSent = "2026-02-13", Status = ApplicationStatus.Sendt },
            new Application { Company = "NTB", Position = "Frontend/Fullstack-utvikler", DateSent = "2026-02-13", Status = ApplicationStatus.Sendt },
            new Application { Company = "Kongsberg (KDA)", Position = "Frontend-utvikler", DateSent = "2026-02-13", Status = ApplicationStatus.Avslag },
            new Application { Company = "Responsiv Media AS", Position = "Webutvikler", DateSent = "2026-02-13", Status = ApplicationStatus.Sendt },
            new Application { Company = "CGI", Position = "Funksjonell arkitekt CRM – Microsoft Dynamics 365 CE", DateSent = "2026-02-13", Status = ApplicationStatus.Sendt },
            new Application { Company = "Loop Academy", Position = "IT-student 2026", DateSent = "2026-02-18", Status = ApplicationStatus.Avslag },
            new Application { Company = "DomeneShop AS", Position = "Kundebehandler", DateSent = "2026-02-18", Status = ApplicationStatus.Sendt },
            new Application { Company = "Propan AS", Position = "API-utvikler", DateSent = "2026-02-18", Status = ApplicationStatus.Sendt },
            new Application { Company = "Intility", Position = "Tech Graduate", DateSent = "2026-02-18", Status = ApplicationStatus.Sendt },
            new Application { Company = "ECIT AS", Position = "Trainee – IT", DateSent = "2026-02-18", Status = ApplicationStatus.Sendt },
            new Application { Company = "TET Digital AS", Position = "Studentmedarbeider", DateSent = "2026-02-21", Status = ApplicationStatus.Sendt },
            new Application { Company = "Posten Bring AS", Position = "Student AI", DateSent = "2026-02-21", Status = ApplicationStatus.Sendt },
            new Application { Company = "Orange Business", Position = "Trainee - Azure Cloud", DateSent = "2026-02-21", Status = ApplicationStatus.Sendt },
            new Application { Company = "Vander", Position = "Full-Stack Utvikler", DateSent = "2026-02-21", Status = ApplicationStatus.Sendt },
            new Application { Company = "Oslo Pensjonforsikring", Position = "Frontendutvikler", DateSent = "2026-02-21", Status = ApplicationStatus.Sendt },
            new Application { Company = "Technogarden AS", Position = "Fullstack utvikler", DateSent = "2026-02-21", Status = ApplicationStatus.Sendt },
            new Application { Company = "Omnium", Position = "Senior Full-Stack Utvikler", DateSent = "2026-02-21", Status = ApplicationStatus.Sendt },
            new Application { Company = "Industrifinans Kapitalforvaltning", Position = "Systemutvikler", DateSent = "2026-02-21", Status = ApplicationStatus.Sendt },
            new Application { Company = "FINK AS", Position = "Senior fullstackutvikler", DateSent = "2026-02-21", Status = ApplicationStatus.Sendt },
            new Application { Company = "Skatteetaten", Position = "Utvikler", DateSent = "2026-02-21", Status = ApplicationStatus.Sendt },
            new Application { Company = "Duett AS", Position = "Teknisk applikasjonsspesialist", DateSent = "2026-02-21", Status = ApplicationStatus.Sendt },
            new Application { Company = "Xledger Labs AS", Position = "Software Engineer", DateSent = "2026-02-22", Status = ApplicationStatus.Sendt },
            new Application { Company = "Opplysningsrådet for veitrafikken AS", Position = "Utvikler dataplattform", DateSent = "2026-02-22", Status = ApplicationStatus.Sendt },
            new Application { Company = "Sopra Steria", Position = "Senior Systemutvikler", DateSent = "2026-02-22", Status = ApplicationStatus.Sendt },
            new Application { Company = "SiMi Consulting", Position = "IT-Support", DateSent = "2026-02-22", Status = ApplicationStatus.Sendt },
            new Application { Company = "Modulvegger AS", Position = "1.linjesupport og brukerstøtte", DateSent = "2026-02-22", Status = ApplicationStatus.Sendt },
            new Application { Company = "Statnett", Position = "Power Platform utvikler", DateSent = "2026-02-22", Status = ApplicationStatus.Sendt },
            new Application { Company = "PST", Position = "IT-servicemedarbeider", DateSent = "2026-02-22", Status = ApplicationStatus.Sendt },
            new Application { Company = "Intuvio", Position = "Teknisk CRM-konsulent", DateSent = "2026-02-22", Status = ApplicationStatus.Sendt },
            new Application { Company = "Anita Systems AS", Position = "IT-Support", DateSent = "2026-02-22", Status = ApplicationStatus.Sendt },
            new Application { Company = "Intility", Position = "Jr. Application Specialist", DateSent = "2026-02-24", Status = ApplicationStatus.Avslag },
            new Application { Company = "Intility", Position = "Technician", DateSent = "2026-02-24", Status = ApplicationStatus.Avslag },
            new Application { Company = "NorgesGruppen", Position = "Summer Internship", DateSent = "2026-02-25", Status = ApplicationStatus.Sendt }
        );
        db.SaveChanges();
    }
}

app.Run();
