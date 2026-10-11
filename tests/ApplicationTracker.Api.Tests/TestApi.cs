using System.Net.Http.Json;
using ApplicationTracker.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ApplicationTracker.Api.Tests;

// Starter hele API-et i minnet, med en egen tom in-memory database per instans.
// Hver test lager sin egen TestApi, så testene påvirker ikke hverandre.
public class TestApi : WebApplicationFactory<Program>
{
  public const string Password = "Passord123";

  public TestApi()
  {
    // Program.cs og TokenService leser JWT_KEY fra miljøvariabel
    Environment.SetEnvironmentVariable("JWT_KEY", "test-nokkel-som-er-minst-32-tegn-lang");
  }

  protected override void ConfigureWebHost(IWebHostBuilder builder)
  {
    var databaseName = Guid.NewGuid().ToString();

    builder.ConfigureServices(services =>
    {
      // Bytt ut PostgreSQL med en in-memory database
      services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
      services.AddDbContext<ApplicationDbContext>(options => options.UseInMemoryDatabase(databaseName));
    });
  }

  // Cookies er satt med Secure = true, så klienten må bruke https
  public HttpClient NewClient() =>
    CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

  // Registrerer en bruker og returnerer en klient som er logget inn
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
