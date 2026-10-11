using System.Net;
using ApplicationTracker.Api.Tests.Helpers;
using System.Net.Http.Json;

namespace ApplicationTracker.Api.Tests.Controllers;

public class AuthControllerTests
{
  // Returns the Set-Cookie header for the refresh token, e.g. "refresh_token=...; expires=...; path=/api/auth"
  private static string RefreshCookie(HttpResponseMessage response) =>
    response.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("refresh_token="));

  private static async Task<HttpResponseMessage> Login(HttpClient client, string username, bool rememberMe)
  {
    var response = await client.PostAsJsonAsync("/api/auth/login", new { username, password = TestApi.Password, rememberMe });
    response.EnsureSuccessStatusCode();
    return response;
  }

  [Fact]
  public async Task WithoutRememberMe_RefreshCookieIsDeletedWhenBrowserCloses()
  {
    using var api = new TestApi();
    await api.LoggedInClient("ola");

    var response = await Login(api.NewClient(), "ola", rememberMe: false);

    Assert.DoesNotContain("expires=", RefreshCookie(response), StringComparison.OrdinalIgnoreCase);
  }

  [Fact]
  public async Task WithRememberMe_RefreshCookieHasExpiryDate()
  {
    using var api = new TestApi();
    await api.LoggedInClient("ola");

    var response = await Login(api.NewClient(), "ola", rememberMe: true);

    Assert.Contains("expires=", RefreshCookie(response), StringComparison.OrdinalIgnoreCase);
  }

  [Fact]
  public async Task Refresh_KeepsTheRememberMeChoice()
  {
    using var api = new TestApi();
    await api.LoggedInClient("ola");
    var client = api.NewClient();
    await Login(client, "ola", rememberMe: true);

    var refresh = await client.PostAsync("/api/auth/refresh", null);

    refresh.EnsureSuccessStatusCode();
    Assert.Contains("expires=", RefreshCookie(refresh), StringComparison.OrdinalIgnoreCase);
  }

  [Fact]
  public async Task Login_IgnoresSpacesAroundUsername()
  {
    using var api = new TestApi();
    await api.LoggedInClient("ola");

    var response = await api.NewClient().PostAsJsonAsync("/api/auth/login", new { username = "  ola ", password = TestApi.Password });

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
  }

  [Fact]
  public async Task Login_DoesNotTrimPassword()
  {
    using var api = new TestApi();
    await api.LoggedInClient("ola");

    var response = await api.NewClient().PostAsJsonAsync("/api/auth/login", new { username = "ola", password = TestApi.Password + " " });

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
  }

  [Fact]
  public async Task Register_TrimsUsername()
  {
    using var api = new TestApi();
    var client = api.NewClient();

    var register = await client.PostAsJsonAsync("/api/auth/register", new
    {
      username = " kari ",
      email = " kari@example.com ",
      fullName = " Kari Nordmann ",
      password = TestApi.Password
    });
    register.EnsureSuccessStatusCode();

    var login = await client.PostAsJsonAsync("/api/auth/login", new { username = "kari", password = TestApi.Password });
    Assert.Equal(HttpStatusCode.OK, login.StatusCode);
  }
}
