using Microsoft.AspNetCore.Identity;

namespace ApplicationTracker.Api.Models;

// IdentityUser gir oss ferdig: Id, UserName, Email, PasswordHash osv.
// Vi legger til FullName som ekstra felt
public class User : IdentityUser
{
  public string FullName { get; set; } = string.Empty;
  public bool IsAdmin { get; set; } = false;
}
