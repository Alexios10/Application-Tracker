using Microsoft.AspNetCore.Identity;

namespace ApplicationTracker.Api.Models;

// IdentityUser already gives us Id, UserName, Email, PasswordHash etc.
// We add FullName as an extra field
public class User : IdentityUser
{
  public string FullName { get; set; } = string.Empty;
  public bool IsAdmin { get; set; } = false;

  // For reset password
  public string? ResetPasswordToken { get; set; }
  public DateTime? ResetPasswordTokenExpires { get; set; }

  // For token refresh/revocation
  public string? RefreshToken { get; set; }
  public DateTime? RefreshTokenExpires { get; set; }

  // "Remember me" choice from the last login. Decides how long the user stays logged in.
  public bool RememberMe { get; set; }
}
