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

// Apply any pending migrations at startup and seed data if empty (only for development/testing purposes)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();

    if (!db.Applications.Any())
    {
        db.Applications.AddRange(
            new Application { Company = "Sopra Steria", Position = "Nyutdannet teknologi", DateSent = "04.02.2026", Status = ApplicationStatus.Avslag },
            new Application { Company = "Vivicta", Position = "Junior ERP/utvikler", DateSent = "04.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Sporveien", Position = "Integrasjonsutvikler", DateSent = "06.02.2026", Status = ApplicationStatus.Avslag },
            new Application { Company = "Gjensidige", Position = "Utvikler", DateSent = "07.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Bouvet", Position = "Nyutdannet Utvikler", DateSent = "08.02.2026", Status = ApplicationStatus.Avslag },
            new Application { Company = "NTB", Position = "Frontend/Fullstack-utvikler", DateSent = "12.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Medic IT", Position = "IT-support", DateSent = "12.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Entur", Position = "Oppstartsprogram for utviklere", DateSent = "13.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "BankID", Position = "Sommerjobb utvikler", DateSent = "13.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Academic Work", Position = "IT-student", DateSent = "13.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Tolletaten", Position = "Sommer jobb IT", DateSent = "13.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "NTB", Position = "Frontend/Fullstack-utvikler", DateSent = "13.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Kongsberg (KDA)", Position = "Frontend-utvikler", DateSent = "13.02.2026", Status = ApplicationStatus.Avslag },
            new Application { Company = "Responsiv Media AS", Position = "Webutvikler", DateSent = "13.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "CGI", Position = "Funksjonell arkitekt CRM – Microsoft Dynamics 365 CE", DateSent = "13.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Loop Academy", Position = "IT-student 2026", DateSent = "18.02.2026", Status = ApplicationStatus.Avslag },
            new Application { Company = "DomeneShop AS", Position = "Kundebehandler", DateSent = "18.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Propan AS", Position = "API-utvikler", DateSent = "18.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Intility", Position = "Tech Graduate", DateSent = "18.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "ECIT AS", Position = "Trainee – IT", DateSent = "18.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "TET Digital AS", Position = "Studentmedarbeider", DateSent = "21.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Posten Bring AS", Position = "Student AI", DateSent = "21.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Orange Business", Position = "Trainee - Azure Cloud", DateSent = "21.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Vander", Position = "Full-Stack Utvikler", DateSent = "21.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Oslo Pensjonforsikring", Position = "Frontendutvikler", DateSent = "21.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Technogarden AS", Position = "Fullstack utvikler", DateSent = "21.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Omnium", Position = "Senior Full-Stack Utvikler", DateSent = "21.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Industrifinans Kapitalforvaltning", Position = "Systemutvikler", DateSent = "21.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "FINK AS", Position = "Senior fullstackutvikler", DateSent = "21.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Skatteetaten", Position = "Utvikler", DateSent = "21.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Duett AS", Position = "Teknisk applikasjonsspesialist", DateSent = "21.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Xledger Labs AS", Position = "Software Engineer", DateSent = "22.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Opplysningsrådet for veitrafikken AS", Position = "Utvikler dataplattform", DateSent = "22.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Sopra Steria", Position = "Senior Systemutvikler", DateSent = "22.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "SiMi Consulting", Position = "IT-Support", DateSent = "22.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Modulvegger AS", Position = "1.linjesupport og brukerstøtte", DateSent = "22.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Statnett", Position = "Power Platform utvikler", DateSent = "22.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "PST", Position = "IT-servicemedarbeider", DateSent = "22.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Intuvio", Position = "Teknisk CRM-konsulent", DateSent = "22.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Anita Systems AS", Position = "IT-Support", DateSent = "22.02.2026", Status = ApplicationStatus.Sendt },
            new Application { Company = "Intility", Position = "Jr. Application Specialist", DateSent = "24.02.2026", Status = ApplicationStatus.Avslag },
            new Application { Company = "Intility", Position = "Technician", DateSent = "24.02.2026", Status = ApplicationStatus.Avslag },
            new Application { Company = "NorgesGruppen", Position = "Summer Internship", DateSent = "25.02.2026", Status = ApplicationStatus.Sendt }
        );
        db.SaveChanges();
    }
}

app.Run();
