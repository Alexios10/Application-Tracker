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

  public void SetAuthCookie(HttpContext context, string token)
  {
    context.Response.Cookies.Append("access_token", token, new CookieOptions
    {
      HttpOnly = true,
      Secure = true,
      SameSite = SameSiteMode.None,
      Path = "/",
      Expires = DateTimeOffset.UtcNow.AddMinutes(15)
    });
  }

  public void SetRefreshCookie(HttpContext context, string refreshToken)
  {
    context.Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
    {
      HttpOnly = true,
      Secure = true,
      SameSite = SameSiteMode.None,
      Path = "/api/auth",
      Expires = DateTimeOffset.UtcNow.AddDays(7)
    });
  }

  public async Task SetAuthAndRefreshCookies(HttpContext context, User user, ApplicationDbContext db)
  {
    var accessToken = GenerateToken(user);
    SetAuthCookie(context, accessToken);

    var refreshToken = GenerateRefreshToken();
    user.RefreshToken = HashToken(refreshToken);
    user.RefreshTokenExpires = DateTime.UtcNow.AddDays(7);
    await db.SaveChangesAsync();

    SetRefreshCookie(context, refreshToken);
  }
}