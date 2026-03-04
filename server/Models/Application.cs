using System.ComponentModel.DataAnnotations;

namespace ApplicationTracker.Api.Models;

public enum ApplicationStatus
{
  Sendt,
  Avslag,
  Intervju,
  Tilbud,
  Ghosted
}

public class Application
{
  public int Id { get; set; }

  [Required]
  [MaxLength(200)]
  public string Company { get; set; } = string.Empty;

  [Required]
  [MaxLength(200)]
  public string Position { get; set; } = string.Empty;

  [MaxLength(20)]
  public string DateSent { get; set; } = string.Empty;

  public ApplicationStatus Status { get; set; }

  // Kobling til brukeren som eier søknaden
  public string? UserId { get; set; }
  public User? User { get; set; }
}
