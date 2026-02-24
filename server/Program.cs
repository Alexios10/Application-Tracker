using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlite(connectionString);
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

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Minimal API setup

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors();

app.MapGet("/api/applications", async (ApplicationDbContext db) =>
    await db.Applications.OrderByDescending(a => a.DateSent).ToListAsync());

app.MapPost("/api/applications", async (ApplicationDbContext db, Application application) =>
{
    if (string.IsNullOrWhiteSpace(application.Id))
    {
        application.Id = Guid.NewGuid().ToString();
    }

    db.Applications.Add(application);
    await db.SaveChangesAsync();
    return Results.Created($"/api/applications/{application.Id}", application);
});

app.MapPut("/api/applications/{id}", async (string id, ApplicationDbContext db, Application updated) =>
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
    existing.Note = updated.Note;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/applications/{id}", async (string id, ApplicationDbContext db) =>
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

app.Run();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}
