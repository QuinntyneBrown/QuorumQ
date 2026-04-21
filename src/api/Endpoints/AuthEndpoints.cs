using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth").WithTags("Auth");

        group.MapPost("/sign-up", SignUp);
        group.MapPost("/sign-in", SignIn).RequireRateLimiting("auth-signin");
        group.MapPost("/sign-out", (Delegate)SignOut);
        group.MapGet("/me", Me).RequireAuthorization();
        group.MapPut("/me/preferences", UpdatePreferences).RequireAuthorization();
        group.MapPost("/verify-email", VerifyEmail);

        return app;
    }

    record SignUpRequest(string Email, string Password, string DisplayName);
    record SignInRequest(string Email, string Password);
    record VerifyEmailRequest(string Token);
    record UpdatePreferencesRequest(string Theme);
    record UserPreferences(string Theme);
    record UserSummary(Guid Id, string Email, string DisplayName, string? AvatarUrl, bool EmailVerified, UserPreferences Preferences);

    static async Task<IResult> SignUp(
        SignUpRequest req,
        AppDbContext db,
        PasswordHasher hasher,
        IDataProtectionProvider dpProvider,
        ILoggerFactory loggerFactory,
        HttpContext ctx)
    {
        if (!IsValidEmail(req.Email))
            return Results.Problem("Invalid email format.", statusCode: 400);

        if (!IsValidPassword(req.Password))
            return Results.Problem(
                "Password must be at least 10 characters and include uppercase, lowercase, digit, and special character.",
                statusCode: 400);

        var normalised = req.Email.ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email == normalised))
            return Results.Problem("Email already in use.", statusCode: 409);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = normalised,
            PasswordHash = hasher.Hash(req.Password),
            DisplayName = req.DisplayName,
            CreatedAt = DateTime.UtcNow,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        // Stub: log verification token (T-012 surfaces actual email sending)
        var protector = dpProvider.CreateProtector("email-verify");
        var token = protector.Protect(user.Id.ToString());
        loggerFactory.CreateLogger("Auth").LogInformation(
            "Verification token for {Email}: {Token}", user.Email, token);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName),
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await ctx.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

        return Results.Created("/auth/me", new UserSummary(user.Id, user.Email, user.DisplayName, user.AvatarUrl, user.EmailVerifiedAt.HasValue, new UserPreferences(user.ThemePreference)));
    }

    static async Task<IResult> SignIn(
        SignInRequest req,
        AppDbContext db,
        PasswordHasher hasher,
        HttpContext ctx)
    {
        var normalised = req.Email.ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == normalised);

        if (user == null || !hasher.Verify(req.Password, user.PasswordHash))
            return Results.Unauthorized();

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName),
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await ctx.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

        return Results.Ok(new UserSummary(user.Id, user.Email, user.DisplayName, user.AvatarUrl, user.EmailVerifiedAt.HasValue, new UserPreferences(user.ThemePreference)));
    }

    static async Task<IResult> SignOut(HttpContext ctx)
    {
        await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Results.NoContent();
    }

    static async Task<IResult> Me(HttpContext ctx, AppDbContext db)
    {
        var userIdClaim = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Results.Unauthorized();

        var user = await db.Users.FindAsync(userId);
        if (user == null) return Results.Unauthorized();

        return Results.Ok(new UserSummary(user.Id, user.Email, user.DisplayName, user.AvatarUrl, user.EmailVerifiedAt.HasValue, new UserPreferences(user.ThemePreference)));
    }

    static async Task<IResult> UpdatePreferences(UpdatePreferencesRequest req, HttpContext ctx, AppDbContext db)
    {
        var userIdClaim = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Results.Unauthorized();

        var allowed = new[] { "system", "light", "dark" };
        if (!allowed.Contains(req.Theme))
            return Results.ValidationProblem(new Dictionary<string, string[]> { ["theme"] = ["Must be system, light, or dark."] });

        var user = await db.Users.FindAsync(userId);
        if (user == null) return Results.Unauthorized();

        user.ThemePreference = req.Theme;
        await db.SaveChangesAsync();

        return Results.Ok(new UserPreferences(user.ThemePreference));
    }

    static async Task<IResult> VerifyEmail(
        VerifyEmailRequest req,
        AppDbContext db,
        IDataProtectionProvider dpProvider)
    {
        try
        {
            var protector = dpProvider.CreateProtector("email-verify");
            var userIdStr = protector.Unprotect(req.Token);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Results.Problem("Invalid token.", statusCode: 400);

            var user = await db.Users.FindAsync(userId);
            if (user == null) return Results.Problem("Invalid token.", statusCode: 400);
            if (user.EmailVerifiedAt.HasValue) return Results.Ok();

            user.EmailVerifiedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Results.Ok();
        }
        catch
        {
            return Results.Problem("Invalid token.", statusCode: 400);
        }
    }

    static bool IsValidEmail(string email) =>
        Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");

    static bool IsValidPassword(string password) =>
        password.Length >= 10 &&
        password.Any(char.IsUpper) &&
        password.Any(char.IsLower) &&
        password.Any(char.IsDigit) &&
        password.Any(c => !char.IsLetterOrDigit(c));
}
