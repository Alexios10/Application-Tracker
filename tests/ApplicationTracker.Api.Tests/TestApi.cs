using System.Net.Http.Json;
using ApplicationTracker.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ApplicationTracker.Api.Tests;

// Runs the whole API in memory, with its own empty in-memory database per instance.
// Each test creates its own TestApi, so tests never affect each other.
public class TestApi : WebApplicationFactory<Program>
{
  public const string Password = "Passord123";

  public TestApi()
  {
    // Program.cs and TokenService read JWT_KEY from an environment variable
    Environment.SetEnvironmentVariable("JWT_KEY", "test-nokkel-som-er-minst-32-tegn-lang");
  }

  protected override void ConfigureWebHost(IWebHostBuilder builder)
  {
    var databaseName = Guid.NewGuid().ToString();

    builder.ConfigureServices(services =>
    {
      // Replace PostgreSQL with an in-memory database
      services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
      services.AddDbContext<ApplicationDbContext>(options => options.UseInMemoryDatabase(databaseName));
    });
  }

  // Cookies are set with Secure = true, so the client must use https
  public HttpClient NewClient() =>
    CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

  // Registers a user and returns a client that is logged in
  public async Task<HttpClient> LoggedInClient(string username, string fullName = "Test Bruker")
  {
    var client = NewClient();

    var register = await client.PostAsJsonAsync("/api/auth/register", new
    {
      username,
      email = $"{username}@example.com",
      fullName,
      password = Password
    });
    register.EnsureSuccessStatusCode();

    var login = await client.PostAsJsonAsync("/api/auth/login", new { username, password = Password });
    login.EnsureSuccessStatusCode();

    return client;
  }
}
