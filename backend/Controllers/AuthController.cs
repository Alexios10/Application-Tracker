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

  // Register a new user
  [HttpPost("register")]
  [EnableRateLimiting("auth")]
  public async Task<IActionResult> Register([FromBody] RegisterRequest request)
  {
    // Spaces before and after are removed from everything except the password,
    // where a space can be a real part of what the user chose
    var username = request.Username?.Trim();
    var email = request.Email?.Trim();
    var fullName = request.FullName?.Trim();

    if (string.IsNullOrWhiteSpace(username) || username.Length > 50)
      return BadRequest(new { error = "Brukernavn er påkrevd (maks 50 tegn)." });
    if (string.IsNullOrWhiteSpace(email) || email.Length > 100)
      return BadRequest(new { error = "E-post er påkrevd (maks 100 tegn)." });
    if (string.IsNullOrWhiteSpace(fullName) || fullName.Length > 100)
      return BadRequest(new { error = "Fullt navn er påkrevd (maks 100 tegn)." });
    if (string.IsNullOrWhiteSpace(request.Password))
      return BadRequest(new { error = "Passord er påkrevd." });

    var existingUser = await _userManager.FindByNameAsync(username);
    if (existingUser is not null)
      return BadRequest(new { error = "Brukernavnet er allerede i bruk." });

    var user = new User
    {
      UserName = username,
      Email = email,
      FullName = fullName
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

  // Log in
  [HttpPost("login")]
  [EnableRateLimiting("auth")]
  public async Task<IActionResult> Login([FromBody] LoginRequest request)
  {
    // "ola " and " ola" should find the user "ola". The password is checked exactly as typed.
    var username = request.Username?.Trim();
    if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(request.Password))
      return BadRequest(new { error = "Feil brukernavn eller passord." });

    var user = await _userManager.FindByNameAsync(username);
    if (user is null)
      return BadRequest(new { error = "Feil brukernavn eller passord." });

    var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
    if (!validPassword)
      return BadRequest(new { error = "Feil brukernavn eller passord." });

    // Saved on the user so the choice is kept when the token is refreshed later
    user.RememberMe = request.RememberMe;
    await _tokenService.SetAuthAndRefreshCookies(HttpContext, user, _db);
    return Ok(new AuthResponse(user.FullName, user.UserName!, user.IsAdmin));
  }

  // Get the logged-in user
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

  // Renew tokens
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

  // Log out
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