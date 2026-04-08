using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.DTOs;
using ApplicationTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ApplicationTracker.Api.Controllers;

[ApiController]
[Authorize]
public class ApplicationsController : ControllerBase
{
  private readonly ApplicationDbContext _db;
  private readonly UserManager<User> _userManager;

  public ApplicationsController(ApplicationDbContext db, UserManager<User> userManager)
  {
    _db = db;
    _userManager = userManager;
  }

  // HENT EGNE SØKNADER
  [HttpGet("api/applications")]
  public async Task<IActionResult> GetApplications()
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var applications = await _db.Applications
        .Where(a => a.UserId == userId)
        .OrderByDescending(a => a.DateSent)
        .AsNoTracking()
        .ToListAsync();

    return Ok(applications);
  }

  // LEGG TIL NY SØKNAD
  [HttpPost("api/applications")]
  public async Task<IActionResult> CreateApplication([FromBody] Application application)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    application.UserId = userId;
    _db.Applications.Add(application);
    await _db.SaveChangesAsync();
    return Created($"/api/applications/{application.Id}", application);
  }

  // OPPDATER SØKNAD
  [HttpPut("api/applications/{id}")]
  public async Task<IActionResult> UpdateApplication(int id, [FromBody] Application updated)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var existing = await _db.Applications.FindAsync(id);

    if (existing is null || existing.UserId != userId)
      return NotFound();

    existing.Company = updated.Company;
    existing.Position = updated.Position;
    existing.DateSent = updated.DateSent;
    existing.Status = updated.Status;

    await _db.SaveChangesAsync();
    return NoContent();
  }

  // SLETT SØKNAD
  [HttpDelete("api/applications/{id}")]
  public async Task<IActionResult> DeleteApplication(int id)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var existing = await _db.Applications.FindAsync(id);

    if (existing is null || existing.UserId != userId)
      return NotFound();

    _db.Applications.Remove(existing);
    await _db.SaveChangesAsync();
    return NoContent();
  }

  // OPPDATER PROFIL
  [HttpPut("api/user")]
  public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest req)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId is null) return Unauthorized();

    var user = await _userManager.FindByIdAsync(userId);
    if (user is null) return NotFound();

    if (!string.IsNullOrWhiteSpace(req.FullName))
    {
      user.FullName = req.FullName;
      if (user.UserName != req.FullName)
        user.UserName = req.FullName;
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

    return Ok();
  }

  // SLETT BRUKER
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