using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Endpoints;

public static class NotificationEndpoints
{
    public static IEndpointRouteBuilder MapNotificationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/notifications")
            .WithTags("Notifications")
            .RequireAuthorization();

        group.MapPost("/{notificationId:guid}/read", MarkRead);

        var prefGroup = app.MapGroup("/notification-preferences")
            .WithTags("Notifications")
            .RequireAuthorization();

        prefGroup.MapGet("/", GetPreferences);
        prefGroup.MapPut("/{teamId:guid}", UpsertPreference);

        return app;
    }

    private record PreferenceDto(Guid TeamId, string TeamName, bool Muted);
    private record UpsertPreferenceRequest(bool Muted);

    private static async Task<IResult> GetPreferences(HttpContext ctx, AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var memberships = await db.Memberships
            .AsNoTracking()
            .Where(m => m.UserId == userId)
            .Select(m => new { m.TeamId, m.Team.Name })
            .ToListAsync();

        var prefs = await db.NotificationPreferences
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .ToDictionaryAsync(p => p.TeamId, p => p.Muted);

        var result = memberships.Select(m => new PreferenceDto(
            m.TeamId,
            m.Name,
            prefs.TryGetValue(m.TeamId, out var muted) && muted));

        return Results.Ok(result);
    }

    private static async Task<IResult> UpsertPreference(
        Guid teamId,
        UpsertPreferenceRequest req,
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var isMember = await db.Memberships
            .AnyAsync(m => m.UserId == userId && m.TeamId == teamId);
        if (!isMember) return Results.Forbid();

        var pref = await db.NotificationPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId && p.TeamId == teamId);

        if (pref is null)
        {
            pref = new NotificationPreference { UserId = userId, TeamId = teamId };
            db.NotificationPreferences.Add(pref);
        }

        pref.Muted = req.Muted;
        await db.SaveChangesAsync();

        return Results.Ok(new PreferenceDto(teamId, "", pref.Muted));
    }

    private static async Task<IResult> MarkRead(
        Guid notificationId,
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var notification = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification is null) return Results.NotFound();

        notification.ReadAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Results.NoContent();
    }
}
