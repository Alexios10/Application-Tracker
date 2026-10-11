using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace ApplicationTracker.Api.Services;

public class TokenService
{
  // How long a user stays logged in without activity.
  // Every refresh (roughly every 15 minutes while the user is active) starts the period again.
  public static readonly TimeSpan RememberMeLifetime = TimeSpan.FromDays(30);
  public static readonly TimeSpan SessionLifetime = TimeSpan.FromHours(1);

  private readonly string _jwtKey;
  private readonly string _jwtIssuer;
  private readonly string _jwtAudience;

  public TokenService(IConfiguration configuration)
  {
    _jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
        ?? configuration["Jwt:Key"]
        ?? throw new InvalidOperationException("JWT Key not configured.");

    if (_jwtKey.Length < 32)
      throw new InvalidOperationException("JWT Key must be at least 32 characters long.");

    _jwtIssuer = configuration["Jwt:Issuer"] ?? "ApplicationTracker";
    _jwtAudience = configuration["Jwt:Audience"] ?? "ApplicationTrackerUsers";
  }

  public string GenerateToken(User user)
  {
    var claims = new[]
    {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName ?? ""),
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim("fullName", user.FullName)
        };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _jwtIssuer,
        audience: _jwtAudience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(15),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
  }

  public string GenerateRefreshToken()
  {
    var bytes = RandomNumberGenerator.GetBytes(32);
    return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_");
  }

  public string HashToken(string token)
  {
    var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
    return Convert.ToBase64String(bytes);
  }

  // Without "remember me" the cookies get no expiry date. They then become session cookies,
  // which the browser deletes when it is closed.
  public void SetAuthCookie(HttpContext context, string token, bool rememberMe)
  {
    context.Response.Cookies.Append("access_token", token, new CookieOptions
    {
      HttpOnly = true,
      Secure = true,
      SameSite = SameSiteMode.None,
      Path = "/",
      Expires = rememberMe ? DateTimeOffset.UtcNow.AddMinutes(15) : null
    });
  }

  public void SetRefreshCookie(HttpContext context, string refreshToken, bool rememberMe)
  {
    context.Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
    {
      HttpOnly = true,
      Secure = true,
      SameSite = SameSiteMode.None,
      Path = "/api/auth",
      Expires = rememberMe ? DateTimeOffset.UtcNow.Add(RememberMeLifetime) : null
    });
  }

  public async Task SetAuthAndRefreshCookies(HttpContext context, User user, ApplicationDbContext db)
  {
    var accessToken = GenerateToken(user);
    SetAuthCookie(context, accessToken, user.RememberMe);

    // The server-side expiry is what actually logs the user out,
    // even if the browser keeps the cookie (e.g. "continue where you left off")
    var lifetime = user.RememberMe ? RememberMeLifetime : SessionLifetime;
    var refreshToken = GenerateRefreshToken();
    user.RefreshToken = HashToken(refreshToken);
    user.RefreshTokenExpires = DateTime.UtcNow.Add(lifetime);
    await db.SaveChangesAsync();

    SetRefreshCookie(context, refreshToken, user.RememberMe);
  }
}