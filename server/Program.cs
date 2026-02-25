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


app.Run();
