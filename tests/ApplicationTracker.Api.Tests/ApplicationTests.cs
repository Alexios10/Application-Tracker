using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace ApplicationTracker.Api.Tests;

public class ApplicationTests
{
  private static object NewApplication(string company = "Equinor") => new
  {
    company,
    position = "Frontend-utvikler",
    dateSent = "2026-10-11",
    status = "Sendt"
  };

  [Fact]
  public async Task Create_IgnoresIdSentByClient()
  {
    using var api = new TestApi();
    var client = await api.LoggedInClient("kari");

    var response = await client.PostAsJsonAsync("/api/applications", new
    {
      id = 999,
      company = "Equinor",
      position = "Frontend-utvikler",
      dateSent = "2026-10-11",
      status = "Sendt"
    });

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    var created = await response.Content.ReadFromJsonAsync<JsonElement>();
    Assert.NotEqual(999, created.GetProperty("id").GetInt32());
  }

  [Fact]
  public async Task Create_WithoutCompany_ReturnsBadRequest()
  {
    using var api = new TestApi();
    var client = await api.LoggedInClient("kari");

    var response = await client.PostAsJsonAsync("/api/applications", new
    {
      position = "Frontend-utvikler",
      dateSent = "2026-10-11",
      status = "Sendt"
    });

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
  }

  [Fact]
  public async Task Get_ReturnsOnlyYourOwnApplications()
  {
    using var api = new TestApi();
    var kari = await api.LoggedInClient("kari");
    var per = await api.LoggedInClient("per");

    await kari.PostAsJsonAsync("/api/applications", NewApplication("Kari AS"));
    await per.PostAsJsonAsync("/api/applications", NewApplication("Per AS"));

    var karisApplications = await kari.GetFromJsonAsync<JsonElement>("/api/applications");

    Assert.Equal(1, karisApplications.GetArrayLength());
    Assert.Equal("Kari AS", karisApplications[0].GetProperty("company").GetString());
  }

  [Fact]
  public async Task Update_SomeoneElsesApplication_ReturnsNotFound()
  {
    using var api = new TestApi();
    var kari = await api.LoggedInClient("kari");
    var per = await api.LoggedInClient("per");

    var created = await kari.PostAsJsonAsync("/api/applications", NewApplication());
    var id = (await created.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetInt32();

    var response = await per.PutAsJsonAsync($"/api/applications/{id}", NewApplication("Hacket AS"));

    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
  }
}
