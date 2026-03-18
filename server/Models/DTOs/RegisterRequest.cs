namespace ApplicationTracker.Api.DTOs;

public record RegisterRequest(string Username, string Email, string FullName, string Password);