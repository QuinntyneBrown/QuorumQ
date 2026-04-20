using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Models;
using System.Security.Claims;

namespace QuorumQ.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth").WithTags("Auth");

        group.MapPost("/sign-up", SignUp);
        group.MapPost("/sign-in", SignIn).RequireRateLimiting("auth-signin");
        group.MapPost("/sign-out", (Delegate)SignOut).RequireAuthorization();
        group.MapGet("/me", GetMe).RequireAuthorization();
        group.MapPost("/verify-email", VerifyEmail).RequireAuthorization();

        return app;
    }

    private static async Task<IResult> SignUp(
        [FromBody] SignUpRequest req,
        AppDbContext db,
        HttpContext ctx,
        CancellationToken ct)
    {
        if (!IsValidEmail(req.Email))
            return Results.ValidationProblem(new Dictionary<string, string[]>
                { ["email"] = ["Invalid email format."] });

        if (req.Password.Length < 10)
            return Results.ValidationProblem(new Dictionary<string, string[]>
                { ["password"] = ["Password must be at least 10 characters."] });

        if (!HasRequiredComplexity(req.Password))
            return Results.ValidationProblem(new Dictionary<string, string[]>
                { ["password"] = ["Password must include letters, numbers, and special characters."] });

        var email = req.Email.Trim().ToLowerInvariant();

        if (await db.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == email, ct))
            return Results.Conflict(new ProblemDetails { Detail = "Email already registered." });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = PasswordHasher.Hash(req.Password),
            DisplayName = req.DisplayName.Trim(),
            CreatedAt = DateTime.UtcNow,
        };
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        await SignInUser(ctx, user);

        return Results.Created("/auth/me", UserSummary.From(user));
    }

    private static async Task<IResult> SignIn(
        [FromBody] SignInRequest req,
        AppDbContext db,
        HttpContext ctx,
        CancellationToken ct)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

        if (user == null || !PasswordHasher.Verify(req.Password, user.PasswordHash))
            return Results.Problem(statusCode: 401, detail: "Invalid credentials.");

        await SignInUser(ctx, user);
        return Results.Ok(UserSummary.From(user));
    }

    private static async Task<IResult> SignOut(HttpContext ctx)
    {
        await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Results.NoContent();
    }

    private static async Task<IResult> GetMe(HttpContext ctx, AppDbContext db, CancellationToken ct)
    {
        var idClaim = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (idClaim == null || !Guid.TryParse(idClaim, out var userId))
            return Results.Unauthorized();

        var user = await db.Users.FindAsync([userId], ct);
        if (user == null) return Results.Unauthorized();

        return Results.Ok(UserSummary.From(user));
    }

    private static async Task<IResult> VerifyEmail(
        [FromBody] VerifyEmailRequest req,
        AppDbContext db,
        HttpContext ctx,
        CancellationToken ct)
    {
        var idClaim = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (idClaim == null || !Guid.TryParse(idClaim, out var userId))
            return Results.Unauthorized();

        var user = await db.Users.FindAsync([userId], ct);
        if (user == null) return Results.Unauthorized();

        user.EmailVerifiedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return Results.NoContent();
    }

    private static Task SignInUser(HttpContext ctx, User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.DisplayName),
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        return ctx.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
    }

    private static bool IsValidEmail(string email)
    {
        try { _ = new System.Net.Mail.MailAddress(email); return true; }
        catch { return false; }
    }

    private static bool HasRequiredComplexity(string password) =>
        password.Any(char.IsLetter) &&
        password.Any(char.IsDigit) &&
        password.Any(c => !char.IsLetterOrDigit(c));
}

public record SignUpRequest(string Email, string Password, string DisplayName);
public record SignInRequest(string Email, string Password);
public record VerifyEmailRequest(string Token);

public record UserSummary(Guid Id, string Email, string DisplayName, string? AvatarUrl, DateTime? EmailVerifiedAt)
{
    public static UserSummary From(User u) => new(u.Id, u.Email, u.DisplayName, u.AvatarUrl, u.EmailVerifiedAt);
}
