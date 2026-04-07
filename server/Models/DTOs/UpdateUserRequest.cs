namespace ApplicationTracker.Api.DTOs;

public record UpdateUserRequest(string? FullName, string? Password, string? CurrentPassword);