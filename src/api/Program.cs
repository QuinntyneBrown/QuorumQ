using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Endpoints;
using QuorumQ.Api.Models;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=quorumq.db"));

builder.Services.AddScoped<PasswordHasher>();
builder.Services.AddHostedService<SessionDeadlineWorker>();

var authOpts = builder.Configuration.GetSection(AuthOptions.Section).Get<AuthOptions>() ?? new AuthOptions();
builder.Services.AddSingleton(authOpts);

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(opts =>
    {
        opts.Cookie.Name = ".QuorumQ.Auth";
        opts.Cookie.HttpOnly = true;
        opts.Cookie.SecurePolicy = builder.Environment.IsProduction()
            ? CookieSecurePolicy.Always
            : CookieSecurePolicy.SameAsRequest;
        opts.Cookie.SameSite = SameSiteMode.Lax;
        opts.SlidingExpiration = true;
        opts.ExpireTimeSpan = TimeSpan.FromDays(authOpts.SessionLifetimeDays);
        opts.Events.OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        opts.Events.OnRedirectToAccessDenied = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

builder.Services.AddScoped<IAuthorizationHandler, TeamMembershipHandler>();
builder.Services.AddAuthorization(opts =>
{
    opts.AddPolicy("TeamMember", policy => policy
        .RequireAuthenticatedUser()
        .AddRequirements(new TeamMembershipRequirement()));
    opts.AddPolicy("TeamAdmin", policy => policy
        .RequireAuthenticatedUser()
        .AddRequirements(new TeamMembershipRequirement { RequiredRole = MembershipRole.Admin }));
    opts.AddPolicy("TeamOwner", policy => policy
        .RequireAuthenticatedUser()
        .AddRequirements(new TeamMembershipRequirement { RequiredRole = MembershipRole.Owner }));
});

builder.Services.AddRateLimiter(opts =>
{
    opts.AddPolicy("auth-signin", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = authOpts.RateLimitMaxAttempts,
                Window = TimeSpan.FromMinutes(authOpts.RateLimitWindowMinutes),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            }));
    opts.AddPolicy("invite-lookup", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            }));
    opts.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddOpenApi();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}

var app = builder.Build();

// Apply migrations and seed on startup in Development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.IsRelational())
    {
        db.Database.Migrate();
        SeedData.Initialize(db);
    }
}

app.UseExceptionHandler();
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapHub<QuorumQ.Api.Hubs.SessionHub>("/hubs/session");

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
   .WithTags("Health")
   .ExcludeFromDescription();

app.MapAuthEndpoints();
app.MapTeamEndpoints();
app.MapInviteEndpoints();
app.MapSessionEndpoints();
app.MapSuggestionEndpoints();
app.MapVoteEndpoints();
app.MapCommentEndpoints();
app.MapReviewEndpoints();
app.MapHistoryEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapPost("/_test/advance-time", async (Guid sessionId, AppDbContext db) =>
    {
        var session = await db.LunchSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session is null) return Results.NotFound();
        session.Deadline = DateTime.UtcNow.AddSeconds(-10);
        await db.SaveChangesAsync();
        return Results.Ok();
    }).WithTags("Test").ExcludeFromDescription();
}

app.Run();

public partial class Program { }
