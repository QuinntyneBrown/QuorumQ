using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;

namespace QuorumQ.Api.Endpoints;

public static class NotificationEndpoints
{
    public static IEndpointRouteBuilder MapNotificationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/notifications")
            .WithTags("Notifications")
            .RequireAuthorization();

        group.MapPost("/{notificationId:guid}/read", MarkRead);

        return app;
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
