using System.ComponentModel.DataAnnotations;
using ApplicationTracker.Api.Models;

namespace ApplicationTracker.Api.DTOs;

// Feltene klienten har lov til å sende når en søknad opprettes eller oppdateres.
// Id og UserId er bevisst utelatt — de settes alltid av serveren.
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
}
