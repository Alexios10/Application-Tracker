using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.DTOs;
using ApplicationTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ApplicationTracker.Api.Controllers;

[ApiController]
[Authorize]
public class ApplicationsController : ControllerBase
{
  private readonly ApplicationDbContext _db;

  public ApplicationsController(ApplicationDbContext db)
  {
    _db = db;
  }

  // Get the logged-in user's applications
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

  // Create a new application
  [HttpPost("api/applications")]
  public async Task<IActionResult> CreateApplication([FromBody] ApplicationRequest request)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // Id and UserId are always set by the server, never by the client
    var application = new Application
    {
      Company = request.Company,
      Position = request.Position,
      DateSent = request.DateSent,
      Status = request.Status,
      Note = request.Note ?? string.Empty,
      JobUrl = EmptyToNull(request.JobUrl),
      Deadline = EmptyToNull(request.Deadline),
      UserId = userId
    };

    _db.Applications.Add(application);
    await _db.SaveChangesAsync();
    return Created($"/api/applications/{application.Id}", application);
  }

  // Update an application
  [HttpPut("api/applications/{id}")]
  public async Task<IActionResult> UpdateApplication(int id, [FromBody] ApplicationRequest updated)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var existing = await _db.Applications.FindAsync(id);

    if (existing is null || existing.UserId != userId)
      return NotFound();

    existing.Company = updated.Company;
    existing.Position = updated.Position;
    existing.DateSent = updated.DateSent;
    existing.Status = updated.Status;
    existing.Note = updated.Note ?? string.Empty;
    existing.JobUrl = EmptyToNull(updated.JobUrl);
    existing.Deadline = EmptyToNull(updated.Deadline);

    await _db.SaveChangesAsync();
    return NoContent();
  }

  // Delete an application
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

  // Optional text fields are stored as null instead of an empty string
  private static string? EmptyToNull(string? value) =>
    string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
