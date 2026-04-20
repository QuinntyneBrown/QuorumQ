using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Endpoints;
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

var authOpts = builder.Configuration.GetSection(AuthOptions.SectionName).Get<AuthOptions>() ?? new AuthOptions();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(opts =>
    {
        opts.Cookie.HttpOnly = true;
        opts.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        opts.Cookie.SameSite = SameSiteMode.Lax;
        opts.SlidingExpiration = true;
        opts.ExpireTimeSpan = TimeSpan.FromDays(authOpts.SessionLifetimeDays);
        opts.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
        opts.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };
    });

builder.Services.AddAuthorization();

builder.Services.AddRateLimiter(opts =>
{
    opts.AddPolicy("auth-signin", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = authOpts.RateLimitAttempts,
                Window = TimeSpan.FromMinutes(authOpts.RateLimitWindowMinutes),
                QueueLimit = 0,
            }));
    opts.RejectionStatusCode = 429;
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
    db.Database.Migrate();
    SeedData.Initialize(db);
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
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapHub<QuorumQ.Api.Hubs.SessionHub>("/hubs/session");

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
   .WithTags("Health")
   .ExcludeFromDescription();

app.MapAuthEndpoints();
app.MapTeamEndpoints();
app.MapSessionEndpoints();
app.MapSuggestionEndpoints();
app.MapVoteEndpoints();
app.MapCommentEndpoints();
app.MapReviewEndpoints();
app.MapHistoryEndpoints();

app.Run();

public partial class Program { }
