namespace ApplicationTracker.Api.DTOs;

public record AuthResponse(string FullName, string Username, bool IsAdmin);