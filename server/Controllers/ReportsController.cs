using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace ApplicationTracker.Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class ReportsController : ControllerBase
  {
    private readonly ApplicationDbContext _context;
    public ReportsController(ApplicationDbContext context)
    {
      _context = context;
    }

    // POST: api/reports — krever innlogging
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReport([FromBody] CreateReportRequest request)
    {
      if (string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Description))
      {
        return BadRequest("Emne og beskrivelse er påkrevd.");
      }

      // Hent bruker-ID fra JWT token — kan ikke forfalskes
      var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

      var report = new Report
      {
        Subject = request.Subject.Trim(),
        Description = request.Description.Trim(),
        UserId = userId,
        CreatedAt = System.DateTime.UtcNow
      };

      _context.Reports.Add(report);
      await _context.SaveChangesAsync();
      return Ok(report);
    }

    // GET: api/reports — kun admin
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<Report>>> GetReports([FromServices] UserManager<User> userManager)
    {
      var user = await userManager.GetUserAsync(HttpContext.User);
      if (user == null)
        return Unauthorized();

      if (!user.IsAdmin)
        return Forbid();

      var reports = await _context.Reports.OrderByDescending(r => r.CreatedAt).ToListAsync();
      return Ok(reports);
    }
  }

  // DTO — kun de feltene vi vil akseptere fra brukeren
  public class CreateReportRequest
  {
    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [MaxLength(5000)]
    public string Description { get; set; } = string.Empty;
  }
}
