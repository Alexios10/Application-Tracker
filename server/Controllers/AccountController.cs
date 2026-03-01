using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace ApplicationTracker.Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class AccountController : ControllerBase
  {
    private readonly ApplicationDbContext _context;
    public AccountController(ApplicationDbContext context)
    {
      _context = context;
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
      var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
      if (user == null)
      {
        // Ikke avslør om e-post finnes
        return Ok();
      }

      // Generer enkel token (for demo, bruk Guid)
      var token = Guid.NewGuid().ToString();
      user.ResetPasswordToken = token;
      user.ResetPasswordTokenExpires = DateTime.UtcNow.AddHours(1);
      await _context.SaveChangesAsync();

      // Returner lenke til frontend
      var resetLink = $"https://minesoknader.no/reset-password?token={token}";
      return Ok(new { resetLink });
    }
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
      var user = await _context.Users.FirstOrDefaultAsync(u => u.ResetPasswordToken == request.Token && u.ResetPasswordTokenExpires > DateTime.UtcNow);
      if (user == null)
      {
        return BadRequest("Ugyldig eller utløpt token.");
      }
      // Oppdater passord (bruk IdentityUserManager i produksjon, her for demo)
      var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
      user.PasswordHash = passwordHasher.HashPassword(user, request.Password!);
      user.ResetPasswordToken = null;
      user.ResetPasswordTokenExpires = null;
      await _context.SaveChangesAsync();
      return Ok();
    }
  }

  public class ResetPasswordRequest
  {
    public string? Token { get; set; }
    public string? Password { get; set; }
  }

  public class ForgotPasswordRequest
  {
    public string? Email { get; set; }
  }
}
