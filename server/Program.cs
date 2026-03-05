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
using System.Threading.RateLimiting;
using System.ComponentModel.DataAnnotations;

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
    // Sterke passordregler
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// ---------- JWT AUTENTISERING ----------
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
    ?? builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key not configured.");

// Sikkerhetskrav: JWT-nøkkel må være minst 32 tegn (256 bits)
if (jwtKey.Length < 32)
    throw new InvalidOperationException("JWT Key must be at least 32 characters long for security.");

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
var allowedOrigins = new List<string>
{
    "https://application-tracker-five-pi.vercel.app",
    "https://minesoknader.no",
    "https://www.minesoknader.no"
};

// Tillat localhost kun under utvikling
if (builder.Environment.IsDevelopment())
{
    allowedOrigins.Add("http://localhost:8080");
    allowedOrigins.Add("http://localhost:5173");
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ---------- RATE LIMITING (hindrer brute-force) ----------
builder.Services.AddRateLimiter(options =>
{
    // Standard rate limit for alle endepunkter
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));

    // Strengere rate limit for auth-endepunkter (login, register, reset)
    options.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(5)
            }));

    options.RejectionStatusCode = 429; // Too Many Requests
});

// ---------- JSON ----------
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();

// ---------- SIKKERHETSHODER ----------
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    await next();
});

app.UseRateLimiter();
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
        expires: DateTime.UtcNow.AddDays(1), // Token varer 1 dag
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}

// ========== AUTH-ENDEPUNKTER ==========

// REGISTRERING
app.MapPost("/api/auth/register", async (UserManager<User> userManager, RegisterRequest request) =>
{
    // Input-validering
    if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Length > 50)
        return Results.BadRequest(new { error = "Brukernavn er påkrevd (maks 50 tegn)." });
    if (string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 100)
        return Results.BadRequest(new { error = "E-post er påkrevd (maks 100 tegn)." });
    if (string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Length > 100)
        return Results.BadRequest(new { error = "Fullt navn er påkrevd (maks 100 tegn)." });
    if (string.IsNullOrWhiteSpace(request.Password))
        return Results.BadRequest(new { error = "Passord er påkrevd." });
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
        // Oversett vanlige Identity-feilmeldinger til norsk
        var errorMessages = result.Errors.Select(e => e.Code switch
        {
            "PasswordTooShort" => "Passordet må være minst 8 tegn.",
            "PasswordRequiresUpper" => "Passordet må inneholde minst én stor bokstav (A-Z).",
            "PasswordRequiresLower" => "Passordet må inneholde minst én liten bokstav (a-z).",
            "PasswordRequiresDigit" => "Passordet må inneholde minst ett tall (0-9).",
            "PasswordRequiresNonAlphanumeric" => "Passordet må inneholde minst ett spesialtegn.",
            "DuplicateUserName" => "Brukernavnet er allerede i bruk.",
            "DuplicateEmail" => "E-postadressen er allerede i bruk.",
            "InvalidEmail" => "Ugyldig e-postadresse.",
            _ => e.Description
        });
        return Results.BadRequest(new { error = string.Join(" ", errorMessages) });
    }

    var token = GenerateToken(user);
    return Results.Ok(new AuthResponse(token, user.FullName, user.UserName!, user.IsAdmin));
}).RequireRateLimiting("auth");

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
}).RequireRateLimiting("auth");

// HENT INNLOGGET BRUKER-INFO
app.MapGet("/api/auth/me", (ClaimsPrincipal user) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    var fullName = user.FindFirstValue("fullName");
    var username = user.FindFirstValue(ClaimTypes.Name);
    return Results.Ok(new { userId, fullName, username });
}).RequireAuthorization();

// ========== APPLICATION-ENDEPUNKTER (beskyttet per bruker) ==========

// Oppdater profil (navn og/eller passord)
app.MapPut("/api/user", async (UserManager<User> userManager, ClaimsPrincipal principal, ApplicationDbContext db, UpdateUserRequest req) =>
{
    var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId is null) return Results.Unauthorized();
    var user = await userManager.FindByIdAsync(userId);
    if (user is null) return Results.NotFound();
    if (!string.IsNullOrWhiteSpace(req.FullName)) user.FullName = req.FullName;
    // Oppdater UserName hvis nytt navn er forskjellig
    if (!string.IsNullOrWhiteSpace(req.FullName) && user.UserName != req.FullName)
        user.UserName = req.FullName;
    var updateResult = await userManager.UpdateAsync(user);
    if (!updateResult.Succeeded) return Results.BadRequest(new { error = "Kunne ikke oppdatere navn." });
    if (!string.IsNullOrWhiteSpace(req.Password))
    {
        // Krev nåværende passord for å endre til nytt
        if (string.IsNullOrWhiteSpace(req.CurrentPassword))
            return Results.BadRequest(new { error = "Nåværende passord er påkrevd for å endre passord." });

        var passResult = await userManager.ChangePasswordAsync(user, req.CurrentPassword, req.Password);
        if (!passResult.Succeeded)
        {
            var msg = passResult.Errors.Any(e => e.Code == "PasswordMismatch")
                ? "Nåværende passord er feil."
                : "Kunne ikke endre passord. Sjekk at det nye passordet oppfyller kravene.";
            return Results.BadRequest(new { error = msg });
        }
    }
    return Results.Ok();
}).RequireAuthorization();

// Slett bruker og tilhørende søknader
app.MapDelete("/api/user", async (UserManager<User> userManager, ClaimsPrincipal principal, ApplicationDbContext db) =>
{
    var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId is null) return Results.Unauthorized();
    var user = await userManager.FindByIdAsync(userId);
    if (user is null) return Results.NotFound();
    // Slett alle søknader først
    var apps = db.Applications.Where(a => a.UserId == userId);
    db.Applications.RemoveRange(apps);
    await db.SaveChangesAsync();
    var result = await userManager.DeleteAsync(user);
    if (!result.Succeeded) return Results.BadRequest(new { error = "Kunne ikke slette bruker." });
    return Results.Ok();
}).RequireAuthorization();

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
// Enkel DTO for oppdatering av bruker
public record UpdateUserRequest(string? FullName, string? Password, string? CurrentPassword);
