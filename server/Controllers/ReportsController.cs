using ApplicationTracker.Api.Data;
using ApplicationTracker.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
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

    // POST: api/reportss
    [HttpPost]
    public async Task<IActionResult> CreateReport([FromBody] Report report)
    {
      if (string.IsNullOrWhiteSpace(report.Subject) || string.IsNullOrWhiteSpace(report.Description))
      {
        return BadRequest("Subject and Description are required.");
      }
      report.CreatedAt = System.DateTime.UtcNow;
      _context.Reports.Add(report);
      await _context.SaveChangesAsync();
      return Ok(report);
    }

    // GET: api/reports
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Report>>> GetReports([FromServices] ApplicationDbContext db, [FromServices] UserManager<User> userManager)
    {
      var user = await userManager.GetUserAsync(HttpContext.User);
      if (user == null || !user.IsAdmin)
      {
        return Forbid();
      }
      var reports = await db.Reports.OrderByDescending(r => r.CreatedAt).ToListAsync();
      return Ok(reports);
    }
  }
}
