using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Legg til controller-tjenester
builder.Services.AddControllers();

// ---------- PORT (Railway) ----------
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// ---------- DATABASE ----------
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    string connectionString;

    if (!string.IsNullOrEmpty(databaseUrl))
    {
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

// ---------- IDENTITY (brukeradministrasjon) ----------
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    // Enkle passordregler — kan strammes inn senere
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// ---------- JWT AUTENTISERING ----------
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
    ?? builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key not configured.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ApplicationTracker";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ApplicationTrackerUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});
builder.Services.AddAuthorization();

// ---------- CORS ----------
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://application-tracker-five-pi.vercel.app", "http://localhost:8080", "https://minesoknader.no",
            "https://www.minesoknader.no")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ---------- JSON ----------
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// For produksjon: server statiske filer fra frontend/dist
app.UseDefaultFiles();
app.UseStaticFiles();

// Map API controllers før fallback
app.MapControllers();

// Fallback: alle ukjente ruter sender index.html (SPA)
app.MapFallbackToFile("index.html");

// ========== HJELPEFUNKSJON: Lag JWT-token ==========
string GenerateToken(User user)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Name, user.UserName ?? ""),
        new Claim(ClaimTypes.Email, user.Email ?? ""),
        new Claim("fullName", user.FullName)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: jwtIssuer,
        audience: jwtAudience,
        claims: claims,
        expires: DateTime.UtcNow.AddDays(7), // Token varer 7 dager
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}

// ========== AUTH-ENDEPUNKTER ==========

// REGISTRERING
app.MapPost("/api/auth/register", async (UserManager<User> userManager, RegisterRequest request) =>
{
    // Sjekk om brukernavn allerede er tatt
    var existingUser = await userManager.FindByNameAsync(request.Username);
    if (existingUser is not null)
        return Results.BadRequest(new { error = "Brukernavnet er allerede i bruk." });

    var user = new User
    {
        UserName = request.Username,
        Email = request.Email,
        FullName = request.FullName
    };

    var result = await userManager.CreateAsync(user, request.Password);

    if (!result.Succeeded)
    {
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        return Results.BadRequest(new { error = errors });
    }

    var token = GenerateToken(user);
    return Results.Ok(new AuthResponse(token, user.FullName, user.UserName!, user.IsAdmin));
});

// INNLOGGING
app.MapPost("/api/auth/login", async (UserManager<User> userManager, LoginRequest request) =>
{
    var user = await userManager.FindByNameAsync(request.Username);
    if (user is null)
        return Results.BadRequest(new { error = "Feil brukernavn eller passord." });

    var validPassword = await userManager.CheckPasswordAsync(user, request.Password);
    if (!validPassword)
        return Results.BadRequest(new { error = "Feil brukernavn eller passord." });

    var token = GenerateToken(user);
    return Results.Ok(new AuthResponse(token, user.FullName, user.UserName!, user.IsAdmin));
});

// HENT INNLOGGET BRUKER-INFO
app.MapGet("/api/auth/me", (ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    var fullName = user.FindFirstValue("fullName");
    var username = user.FindFirstValue(ClaimTypes.Name);
    return Results.Ok(new { userId, fullName, username });
}).RequireAuthorization();

// ========== APPLICATION-ENDEPUNKTER (beskyttet per bruker) ==========

// Hent kun EGNE søknader
app.MapGet("/api/applications", async (ApplicationDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
    return await db.Applications
        .Where(a => a.UserId == userId)
        .OrderByDescending(a => a.DateSent)
        .ToListAsync();
}).RequireAuthorization();

// Legg til ny søknad (kobles automatisk til innlogget bruker)
app.MapPost("/api/applications", async (ApplicationDbContext db, ClaimsPrincipal user, Application application) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
    application.UserId = userId;
    db.Applications.Add(application);
    await db.SaveChangesAsync();
    return Results.Created($"/api/applications/{application.Id}", application);
}).RequireAuthorization();

// Oppdater søknad (kun hvis den tilhører innlogget bruker)
app.MapPut("/api/applications/{id}", async (int id, ApplicationDbContext db, ClaimsPrincipal user, Application updated) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var existing = await db.Applications.FindAsync(id);
    if (existing is null || existing.UserId != userId)
        return Results.NotFound();

    existing.Company = updated.Company;
    existing.Position = updated.Position;
    existing.DateSent = updated.DateSent;
    existing.Status = updated.Status;

    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

// Slett søknad (kun hvis den tilhører innlogget bruker)
app.MapDelete("/api/applications/{id}", async (int id, ApplicationDbContext db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var existing = await db.Applications.FindAsync(id);
    if (existing is null || existing.UserId != userId)
        return Results.NotFound();

    db.Applications.Remove(existing);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

// ---------- MIGRATION + SEED ----------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

app.Run();

// ---------- DTO-er (Data Transfer Objects) ----------
public record RegisterRequest(string Username, string Email, string FullName, string Password);
public record LoginRequest(string Username, string Password);
public record AuthResponse(string Token, string FullName, string Username, bool IsAdmin);
