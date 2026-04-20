using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QuorumQ.Api.Data;
using System.Net;
using System.Net.Http.Json;

namespace QuorumQ.Api.Tests;

public class AuthEndpointsTests : IClassFixture<AuthTestFactory>
{
    private readonly HttpClient _client;

    public AuthEndpointsTests(AuthTestFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact(DisplayName = "[L2-42] passwords are not stored in plaintext")]
    public async Task Passwords_AreNotStoredInPlaintext()
    {
        var res = await _client.PostAsJsonAsync("/auth/sign-up",
            new { email = "plain@test.com", password = "S3cur3P@ssword!", displayName = "Test" });

        Assert.Equal(HttpStatusCode.Created, res.StatusCode);

        using var scope = AuthTestFactory.ScopeFactory!.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await db.Users.FirstAsync(u => u.Email == "plain@test.com");

        Assert.NotEqual("S3cur3P@ssword!", user.PasswordHash);
        Assert.StartsWith("pbkdf2$", user.PasswordHash);
    }

    [Fact(DisplayName = "[L2-05] five consecutive failed sign-ins trigger a 429")]
    public async Task FiveFailedSignIns_Trigger429()
    {
        await _client.PostAsJsonAsync("/auth/sign-up",
            new { email = "ratelimit@test.com", password = "S3cur3P@ssword!", displayName = "RL" });

        for (int i = 0; i < 5; i++)
        {
            await _client.PostAsJsonAsync("/auth/sign-in",
                new { email = "ratelimit@test.com", password = "WrongPassword1!" });
        }

        var res = await _client.PostAsJsonAsync("/auth/sign-in",
            new { email = "ratelimit@test.com", password = "WrongPassword1!" });

        Assert.Equal(HttpStatusCode.TooManyRequests, res.StatusCode);
    }

    [Fact(DisplayName = "[L2-06] /auth/me round-trips the session cookie")]
    public async Task AuthMe_RoundTrips_SessionCookie()
    {
        var signUp = await _client.PostAsJsonAsync("/auth/sign-up",
            new { email = "session@test.com", password = "S3cur3P@ssword!", displayName = "Session" });

        Assert.Equal(HttpStatusCode.Created, signUp.StatusCode);

        var me = await _client.GetAsync("/auth/me");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);

        var body = await me.Content.ReadFromJsonAsync<UserSummaryDto>();
        Assert.NotNull(body);
        Assert.Equal("session@test.com", body!.Email);
    }

    private record UserSummaryDto(Guid Id, string Email, string DisplayName, string? AvatarUrl, DateTime? EmailVerifiedAt);
}

public class AuthTestFactory : WebApplicationFactory<Program>
{
    public static IServiceScopeFactory? ScopeFactory { get; private set; }

    private static SqliteConnection? _conn;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor != null) services.Remove(descriptor);

            _conn = new SqliteConnection("Data Source=:memory:");
            _conn.Open();

            services.AddDbContext<AppDbContext>(opts =>
                opts.UseSqlite(_conn));

            services.PostConfigure<Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationOptions>(
                Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationDefaults.AuthenticationScheme,
                opts => opts.Cookie.SecurePolicy = CookieSecurePolicy.None);
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _conn?.Dispose();
    }

    public new HttpClient CreateClient()
    {
        var client = base.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            HandleCookies = true,
        });
        ScopeFactory = Services.GetRequiredService<IServiceScopeFactory>();

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();

        return client;
    }
}
