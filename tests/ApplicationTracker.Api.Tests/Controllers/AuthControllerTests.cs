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
}
