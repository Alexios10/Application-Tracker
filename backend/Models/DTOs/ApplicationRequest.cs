using System.ComponentModel.DataAnnotations;
using ApplicationTracker.Api.Models;

namespace ApplicationTracker.Api.DTOs;

// The fields a client is allowed to send when creating or updating an application.
// Id and UserId are left out on purpose - the server always sets them.
public class ApplicationRequest
{
  [Required]
  [MaxLength(200)]
  public string Company { get; set; } = string.Empty;

  [Required]
  [MaxLength(200)]
  public string Position { get; set; } = string.Empty;

  [MaxLength(20)]
  public string DateSent { get; set; } = string.Empty;

  public ApplicationStatus Status { get; set; }

  [MaxLength(1000)]
  public string? Note { get; set; }

  // Only http(s) links are allowed, so a link like "javascript:..." can never be saved
  [MaxLength(500)]
  [RegularExpression(@"^https?://\S+$", ErrorMessage = "Lenken må starte med http:// eller https://")]
  public string? JobUrl { get; set; }

  [MaxLength(20)]
  public string? Deadline { get; set; }
}
