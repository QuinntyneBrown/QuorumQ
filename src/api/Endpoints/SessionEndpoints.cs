using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Endpoints;

public static class SessionEndpoints
{
    private record StartSessionRequest(DateTime? Deadline);
    private record SessionSummary(Guid Id, string State, DateTime Deadline, DateTime StartedAt);

    public static IEndpointRouteBuilder MapSessionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/teams/{teamId:guid}/sessions")
            .WithTags("Sessions")
            .RequireAuthorization();

        group.MapPost("/", StartSession).RequireTeamMembership(MembershipRole.Admin);

        return app;
    }

    private static async Task<IResult> StartSession(
        Guid teamId,
        StartSessionRequest req,
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var existing = await db.LunchSessions
            .AnyAsync(s => s.TeamId == teamId &&
                      (s.State == SessionState.Suggesting || s.State == SessionState.Voting));
        if (existing)
            return Results.Problem("A session is already active.", statusCode: 409);

        var deadline = req.Deadline ?? DateTime.UtcNow.AddMinutes(30);
        var session = new LunchSession
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            State = SessionState.Suggesting,
            Deadline = deadline,
            StartedBy = userId,
            StartedAt = DateTime.UtcNow,
        };

        db.LunchSessions.Add(session);
        await db.SaveChangesAsync();

        return Results.Created(
            $"/teams/{teamId}/sessions/{session.Id}",
            new SessionSummary(session.Id, session.State.ToString(), session.Deadline, session.StartedAt));
    }
}
