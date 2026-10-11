using ApplicationTracker.Api.Tests.Helpers;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace ApplicationTracker.Api.Tests.Controllers;

public class UserControllerTests
{
  [Fact]
  public async Task ChangingFullName_DoesNotChangeLoginUsername()
  {
    using var api = new TestApi();
    var client = await api.LoggedInClient("ola");

    var update = await client.PutAsJsonAsync("/api/user", new { fullName = "Ola Nordmann" });
    Assert.Equal(HttpStatusCode.OK, update.StatusCode);

    // The user must still be able to log in with the original username
    var freshClient = api.NewClient();
    var login = await freshClient.PostAsJsonAsync("/api/auth/login", new { username = "ola", password = TestApi.Password });
    Assert.Equal(HttpStatusCode.OK, login.StatusCode);

    var me = await freshClient.GetFromJsonAsync<JsonElement>("/api/auth/me");
    Assert.Equal("ola", me.GetProperty("username").GetString());
    Assert.Equal("Ola Nordmann", me.GetProperty("fullName").GetString());
  }

  [Fact]
  public async Task ChangingUsername_AllowsLoginWithNewUsername()
  {
    using var api = new TestApi();
    var client = await api.LoggedInClient("ola");

    var update = await client.PutAsJsonAsync("/api/user", new { username = "ola.nordmann" });
    Assert.Equal(HttpStatusCode.OK, update.StatusCode);

    var freshClient = api.NewClient();
    var oldLogin = await freshClient.PostAsJsonAsync("/api/auth/login", new { username = "ola", password = TestApi.Password });
    var newLogin = await freshClient.PostAsJsonAsync("/api/auth/login", new { username = "ola.nordmann", password = TestApi.Password });

    Assert.Equal(HttpStatusCode.BadRequest, oldLogin.StatusCode);
    Assert.Equal(HttpStatusCode.OK, newLogin.StatusCode);
  }

  [Fact]
  public async Task ChangingUsername_ToTakenUsername_ReturnsBadRequest()
  {
    using var api = new TestApi();
    await api.LoggedInClient("kari");
    var ola = await api.LoggedInClient("ola");

    var update = await ola.PutAsJsonAsync("/api/user", new { username = "kari" });

    Assert.Equal(HttpStatusCode.BadRequest, update.StatusCode);
    var body = await update.Content.ReadFromJsonAsync<JsonElement>();
    Assert.Equal("Brukernavnet er allerede i bruk.", body.GetProperty("error").GetString());
  }
}
