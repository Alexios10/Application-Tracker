using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.DTOs;
using ApplicationTracker.Api.Models;
using ApplicationTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace ApplicationTracker.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
  private readonly UserManager<User> _userManager;
  private readonly ApplicationDbContext _db;
  private readonly TokenService _tokenService;

  public AuthController(UserManager<User> userManager, ApplicationDbContext db, TokenService tokenService)
  {
    _userManager = userManager;
    _db = db;
    _tokenService = tokenService;
  }

  // REGISTRERING
  [HttpPost("register")]
  [EnableRateLimiting("auth")]
  public async Task<IActionResult> Register([FromBody] RegisterRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Length > 50)
      return BadRequest(new { error = "Brukernavn er påkrevd (maks 50 tegn)." });
    if (string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 100)
      return BadRequest(new { error = "E-post er påkrevd (maks 100 tegn)." });
    if (string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Length > 100)
      return BadRequest(new { error = "Fullt navn er påkrevd (maks 100 tegn)." });
    if (string.IsNullOrWhiteSpace(request.Password))
      return BadRequest(new { error = "Passord er påkrevd." });

    var existingUser = await _userManager.FindByNameAsync(request.Username);
    if (existingUser is not null)
      return BadRequest(new { error = "Brukernavnet er allerede i bruk." });

    var user = new User
    {
      UserName = request.Username,
      Email = request.Email,
      FullName = request.FullName
    };

    var result = await _userManager.CreateAsync(user, request.Password);

    if (!result.Succeeded)
    {
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
      return BadRequest(new { error = string.Join(" ", errorMessages) });
    }

    return Ok(new { message = "Bruker registrert." });
  }

  // INNLOGGING
  [HttpPost("login")]
  [EnableRateLimiting("auth")]
  public async Task<IActionResult> Login([FromBody] LoginRequest request)
  {
    var user = await _userManager.FindByNameAsync(request.Username);
    if (user is null)
      return BadRequest(new { error = "Feil brukernavn eller passord." });

    var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
    if (!validPassword)
      return BadRequest(new { error = "Feil brukernavn eller passord." });

    await _tokenService.SetAuthAndRefreshCookies(HttpContext, user, _db);
    return Ok(new AuthResponse(user.FullName, user.UserName!, user.IsAdmin));
  }

  // HENT INNLOGGET BRUKER
  [HttpGet("me")]
  [Authorize]
  public async Task<IActionResult> Me()
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId is null) return Unauthorized();

    var user = await _userManager.FindByIdAsync(userId);
    if (user is null) return Unauthorized();

    return Ok(new AuthResponse(user.FullName, user.UserName!, user.IsAdmin));
  }

  // FORNY TOKENS
  [HttpPost("refresh")]
  [EnableRateLimiting("auth")]
  public async Task<IActionResult> Refresh()
  {
    var refreshCookie = Request.Cookies["refresh_token"];
    if (string.IsNullOrEmpty(refreshCookie))
      return Unauthorized();

    var hashedToken = _tokenService.HashToken(refreshCookie);
    var user = await _db.Users.FirstOrDefaultAsync(
        u => u.RefreshToken == hashedToken && u.RefreshTokenExpires > DateTime.UtcNow);

    if (user is null)
      return Unauthorized();

    await _tokenService.SetAuthAndRefreshCookies(HttpContext, user, _db);
    return Ok(new AuthResponse(user.FullName, user.UserName!, user.IsAdmin));
  }

  // UTLOGGING
  [HttpPost("logout")]
  public async Task<IActionResult> Logout()
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId is not null)
    {
      var user = await _db.Users.FindAsync(userId);
      if (user is not null)
      {
        user.RefreshToken = null;
        user.RefreshTokenExpires = null;
        await _db.SaveChangesAsync();
      }
    }

    Response.Cookies.Delete("access_token", new CookieOptions
    {
      Path = "/",
      Secure = true,
      SameSite = SameSiteMode.None
    });
    Response.Cookies.Delete("refresh_token", new CookieOptions
    {
      Path = "/api/auth",
      Secure = true,
      SameSite = SameSiteMode.None
    });

    return Ok();
  }
}