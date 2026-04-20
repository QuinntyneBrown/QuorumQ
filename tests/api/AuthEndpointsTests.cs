using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using QuorumQ.Api.Data;

namespace QuorumQ.Api.Tests;

/// <summary>
/// Keeps a SQLite in-memory connection open for the lifetime of the factory.
/// Using SQLite (same provider as production) avoids the "multiple providers" conflict
/// that occurs when mixing SQLite and InMemory EF Core providers.
/// </summary>
sealed class AuthTestFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _keeper;
    private readonly string _connString;

    public AuthTestFactory()
    {
        _connString = $"Data Source=auth_{Guid.NewGuid():N};Mode=Memory;Cache=Shared";
        _keeper = new SqliteConnection(_connString);
        _keeper.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Test");
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.AddDbContext<AppDbContext>(opts =>
                opts.UseSqlite(_connString));
        });
    }

    public void EnsureSchema()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing) _keeper.Dispose();
        base.Dispose(disposing);
    }
}

public class AuthEndpointsTests
{
    [Fact(DisplayName = "[L2-42] passwords are not stored in plaintext")]
    public async Task PasswordsNotStoredInPlaintext()
    {
        using var factory = new AuthTestFactory();
        factory.EnsureSchema();
        var client = factory.CreateClient();

        var res = await client.PostAsJsonAsync("/auth/sign-up",
            new { email = "plain@example.com", password = "Password1!", displayName = "Plain" });
        var body = await res.Content.ReadAsStringAsync();
        Assert.True(res.StatusCode == HttpStatusCode.Created, $"Status: {res.StatusCode}, Body: {body}");

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await db.Users.IgnoreQueryFilters().FirstAsync(u => u.Email == "plain@example.com");

        Assert.DoesNotContain("Password1!", user.PasswordHash);
        Assert.StartsWith("pbkdf2$", user.PasswordHash);
    }

    [Fact(DisplayName = "[L2-05] five consecutive failed sign-ins trigger a 429")]
    public async Task RateLimitTriggersAfterFiveFailedSignIns()
    {
        using var factory = new AuthTestFactory();
        factory.EnsureSchema();
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

        for (int i = 0; i < 5; i++)
        {
            var res = await client.PostAsJsonAsync("/auth/sign-in",
                new { email = "nobody@example.com", password = "wrongpassword" });
            Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
        }

        var blocked = await client.PostAsJsonAsync("/auth/sign-in",
            new { email = "nobody@example.com", password = "wrongpassword" });
        Assert.Equal(HttpStatusCode.TooManyRequests, blocked.StatusCode);
    }

    [Fact(DisplayName = "[L2-06] /auth/me round-trips the session cookie")]
    public async Task AuthMe_ReturnsCurrent_WhenSignedIn()
    {
        using var factory = new AuthTestFactory();
        factory.EnsureSchema();
        var client = factory.CreateClient();

        var signUp = await client.PostAsJsonAsync("/auth/sign-up",
            new { email = "me@example.com", password = "Password1!", displayName = "Me User" });
        var upBody = await signUp.Content.ReadAsStringAsync();
        Assert.True(signUp.StatusCode == HttpStatusCode.Created, $"Sign-up: {signUp.StatusCode}, {upBody}");

        var signIn = await client.PostAsJsonAsync("/auth/sign-in",
            new { email = "me@example.com", password = "Password1!" });
        Assert.Equal(HttpStatusCode.OK, signIn.StatusCode);

        var me = await client.GetAsync("/auth/me");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);

        var body = await me.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("me@example.com", body.GetProperty("email").GetString());
        Assert.Equal("Me User", body.GetProperty("displayName").GetString());
    }
}
