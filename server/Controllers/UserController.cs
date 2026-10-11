using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.DTOs;
using ApplicationTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ApplicationTracker.Api.Controllers;

// Endpoints for the logged-in user's own account (/api/user)
[ApiController]
[Authorize]
public class UserController : ControllerBase
{
  private readonly ApplicationDbContext _db;
  private readonly UserManager<User> _userManager;

  public UserController(ApplicationDbContext db, UserManager<User> userManager)
  {
    _db = db;
    _userManager = userManager;
  }

  // Update the logged-in user's profile
  [HttpPut("api/user")]
  public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest req)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId is null) return Unauthorized();

    var user = await _userManager.FindByIdAsync(userId);
    if (user is null) return NotFound();

    // FullName is the display name, UserName is what the user logs in with
    if (!string.IsNullOrWhiteSpace(req.FullName))
    {
      var fullName = req.FullName.Trim();
      if (fullName.Length > 100)
        return BadRequest(new { error = "Fullt navn kan maks være 100 tegn." });

      user.FullName = fullName;
    }

    if (!string.IsNullOrWhiteSpace(req.Username) && req.Username.Trim() != user.UserName)
    {
      var username = req.Username.Trim();
      if (username.Length > 50)
        return BadRequest(new { error = "Brukernavnet kan maks være 50 tegn." });

      // SetUserNameAsync checks that the username is valid and not already taken
      var usernameResult = await _userManager.SetUserNameAsync(user, username);
      if (!usernameResult.Succeeded)
      {
        var msg = usernameResult.Errors.Any(e => e.Code == "DuplicateUserName")
            ? "Brukernavnet er allerede i bruk."
            : "Brukernavnet kan bare inneholde bokstaver (a-z), tall og tegnene - . _ @ +";
        return BadRequest(new { error = msg });
      }
    }

    var updateResult = await _userManager.UpdateAsync(user);
    if (!updateResult.Succeeded)
      return BadRequest(new { error = "Kunne ikke oppdatere navn." });

    if (!string.IsNullOrWhiteSpace(req.Password))
    {
      if (string.IsNullOrWhiteSpace(req.CurrentPassword))
        return BadRequest(new { error = "Nåværende passord er påkrevd for å endre passord." });

      var passResult = await _userManager.ChangePasswordAsync(user, req.CurrentPassword, req.Password);
      if (!passResult.Succeeded)
      {
        var msg = passResult.Errors.Any(e => e.Code == "PasswordMismatch")
            ? "Nåværende passord er feil."
            : "Kunne ikke endre passord. Sjekk at det nye passordet oppfyller kravene.";
        return BadRequest(new { error = msg });
      }
    }

    return Ok(new AuthResponse(user.FullName, user.UserName!, user.IsAdmin));
  }

  // Delete the logged-in user and all their applications
  [HttpDelete("api/user")]
  public async Task<IActionResult> DeleteUser()
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId is null) return Unauthorized();

    var user = await _userManager.FindByIdAsync(userId);
    if (user is null) return NotFound();

    var apps = _db.Applications.Where(a => a.UserId == userId);
    _db.Applications.RemoveRange(apps);
    await _db.SaveChangesAsync();

    var result = await _userManager.DeleteAsync(user);
    if (!result.Succeeded)
      return BadRequest(new { error = "Kunne ikke slette bruker." });

    return Ok();
  }
}
