using System;

namespace ApplicationTracker.Api.Models
{
  public class Report
  {
    public int Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? UserId { get; set; } // Kan være null hvis anonym
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  }
}