using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Cryptography;
using System.ComponentModel.DataAnnotations;

namespace ApplicationTracker.Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class AccountController : ControllerBase
  {
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;

    public AccountController(ApplicationDbContext context, UserManager<User> userManager)
    {
      _context = context;
      _userManager = userManager;
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
      // Validering
      if (string.IsNullOrWhiteSpace(request.Email))
        return BadRequest("E-post er påkrevd.");

      var normalizedEmail = request.Email.Trim().ToUpperInvariant();
      var user = await _context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

      if (user == null)
      {
        // Ikke avslør om e-post finnes — returnerer alltid OK
        return Ok();
      }

      // Generer kryptografisk sikker token og lagre kun hashen i databasen
      var tokenBytes = RandomNumberGenerator.GetBytes(32);
      var token = Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_");
      user.ResetPasswordToken = HashToken(token);
      user.ResetPasswordTokenExpires = DateTime.UtcNow.AddHours(1);
      await _context.SaveChangesAsync();

      // Bygg reset-lenke med fast frontend-URL (aldri stol på Origin-header)
      var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "https://minesoknader.no";
      var resetLink = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(token)}";

      // Send e-post i bakgrunnen — ikke blokker HTTP-responsen
      _ = Task.Run(async () =>
      {
        try
        {
          await SendResetEmail(user.Email!, resetLink);
          Console.WriteLine($"[EMAIL] Reset-e-post sendt til {user.Email}");
        }
        catch (Exception ex)
        {
          Console.WriteLine($"[EMAIL ERROR] {ex.GetType().Name}: {ex.Message}");
          if (ex.InnerException != null)
            Console.WriteLine($"[EMAIL INNER] {ex.InnerException.GetType().Name}: {ex.InnerException.Message}");
        }
      });

      return Ok();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
      // Validering
      if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.Password))
        return BadRequest("Token og passord er påkrevd.");

      if (request.Password.Length < 8)
        return BadRequest("Passordet må være minst 8 tegn.");

      // Sammenlign med hashet versjon (vi lagrer aldri token i klartekst)
      var hashedToken = HashToken(request.Token);
      var user = await _context.Users.FirstOrDefaultAsync(
        u => u.ResetPasswordToken == hashedToken && u.ResetPasswordTokenExpires > DateTime.UtcNow);

      if (user == null)
        return BadRequest("Ugyldig eller utløpt token.");

      // Bruk UserManager for å validere og sette passord (respekterer passordregler)
      var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
      var result = await _userManager.ResetPasswordAsync(user, resetToken, request.Password);

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
          _ => "Passordet oppfyller ikke kravene."
        });
        return BadRequest(new { error = string.Join(" ", errorMessages) });
      }

      // Fjern brukt reset-token
      user.ResetPasswordToken = null;
      user.ResetPasswordTokenExpires = null;
      await _context.SaveChangesAsync();

      return Ok();
    }

    private static readonly HttpClient _httpClient = new();

    private static async Task SendResetEmail(string toEmail, string resetLink)
    {
      var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
          ?? throw new InvalidOperationException("RESEND_API_KEY env variable is not set.");
      var fromEmail = Environment.GetEnvironmentVariable("RESEND_FROM") ?? "Mine Søknader <onboarding@resend.dev>";

      Console.WriteLine($"[EMAIL DEBUG] Sending to: {toEmail}, from: {fromEmail}");

      var payload = new
      {
        from = fromEmail,
        to = new[] { toEmail },
        subject = "Tilbakestill passord – Mine Søknader",
        html = $@"
        <div style='font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;'>
          <h2 style='color: #0f172a;'>Tilbakestill passord</h2>
          <p>Du har bedt om å tilbakestille passordet ditt. Klikk på knappen under:</p>
          <a href='{resetLink}' style='display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;'>
            Tilbakestill passord
          </a>
          <p style='margin-top: 16px; color: #64748b; font-size: 14px;'>
            Lenken utløper om 1 time. Hvis du ikke ba om dette, kan du ignorere denne e-posten.
          </p>
        </div>"
      };

      var json = JsonSerializer.Serialize(payload);
      using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
      request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
      request.Content = new StringContent(json, Encoding.UTF8, "application/json");

      var response = await _httpClient.SendAsync(request);
      var body = await response.Content.ReadAsStringAsync();

      if (!response.IsSuccessStatusCode)
        throw new Exception($"Resend API feilet ({response.StatusCode}): {body}");

      Console.WriteLine($"[EMAIL] Resend response: {body}");
    }

    /// <summary>
    /// Hasher en token med SHA-256 slik at vi aldri lagrer klartekst i databasen.
    /// </summary>
    private static string HashToken(string token)
    {
      var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
      return Convert.ToBase64String(bytes);
    }
  }

  public class ResetPasswordRequest
  {
    [Required]
    public string? Token { get; set; }

    [Required]
    [MinLength(8, ErrorMessage = "Passordet må være minst 8 tegn.")]
    public string? Password { get; set; }
  }

  public class ForgotPasswordRequest
  {
    [Required]
    [EmailAddress(ErrorMessage = "Ugyldig e-postadresse.")]
    public string? Email { get; set; }
  }
}
