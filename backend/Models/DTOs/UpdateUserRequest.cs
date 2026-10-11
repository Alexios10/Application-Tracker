namespace ApplicationTracker.Api.DTOs;

public record UpdateUserRequest(string? FullName, string? Username, string? Password, string? CurrentPassword);