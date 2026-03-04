using System;
using System.ComponentModel.DataAnnotations;

namespace ApplicationTracker.Api.Models
{
  public class Report
  {
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [MaxLength(5000)]
    public string Description { get; set; } = string.Empty;

    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  }
}