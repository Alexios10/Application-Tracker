using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace ApplicationTracker.Api.Tests;

public class UserTests
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
}
