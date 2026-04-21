using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;

namespace QuorumQ.Api.Endpoints;

public static class TestEndpoints
{
    public static IEndpointRouteBuilder MapTestEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/_test")
            .WithTags("Test")
            .ExcludeFromDescription();

        group.MapPost("/advance-time", async (Guid sessionId, AppDbContext db) =>
        {
            var session = await db.LunchSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
            if (session is null) return Results.NotFound();
            session.Deadline = DateTime.UtcNow.AddSeconds(-10);
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        group.MapPost("/advance-tie-break", async (Guid sessionId, AppDbContext db) =>
        {
            var session = await db.LunchSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
            if (session is null) return Results.NotFound();
            if (!session.TieBreakDeadline.HasValue) return Results.BadRequest("No tie-break in progress.");
            session.TieBreakDeadline = DateTime.UtcNow.AddSeconds(-10);
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        return app;
    }
}
