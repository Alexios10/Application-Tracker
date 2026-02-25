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
  public string Company { get; set; } = string.Empty;
  public string Position { get; set; } = string.Empty;
  public string DateSent { get; set; } = string.Empty;
  public ApplicationStatus Status { get; set; }
  public string? Note { get; set; }
}
