using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Hubs;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Endpoints;

public static class VoteEndpoints
{
    private record CastVoteRequest(Guid? SuggestionId);
    internal record TallyEntry(Guid SuggestionId, int Count, bool YouVoted);

    public static IEndpointRouteBuilder MapVoteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/sessions/{sessionId:guid}/votes")
            .WithTags("Votes")
            .RequireAuthorization();

        group.MapPut("/", CastVote);

        return app;
    }

    private static async Task<IResult> CastVote(
        Guid sessionId,
        CastVoteRequest req,
        HttpContext ctx,
        AppDbContext db,
        IHubContext<SessionHub, ISessionHubClient> hub)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var session = await db.LunchSessions.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session is null) return Results.NotFound();

        if (session.State != SessionState.Voting)
            return Results.Problem("Votes can only be cast during the Voting phase.", statusCode: 409);

        var isMember = await db.Memberships.AnyAsync(m => m.UserId == userId && m.TeamId == session.TeamId);
        if (!isMember) return Results.Forbid();

        if (req.SuggestionId is not null)
        {
            var suggestionExists = await db.Suggestions.AnyAsync(
                s => s.Id == req.SuggestionId && s.SessionId == sessionId && s.WithdrawnAt == null);
            if (!suggestionExists) return Results.NotFound();
        }

        var existing = await db.Votes
            .FirstOrDefaultAsync(v => v.SessionId == sessionId && v.UserId == userId);

        if (req.SuggestionId is null)
        {
            if (existing is not null)
            {
                db.Votes.Remove(existing);
                await db.SaveChangesAsync();
            }
        }
        else if (existing is null)
        {
            db.Votes.Add(new Vote
            {
                Id = Guid.NewGuid(),
                SessionId = sessionId,
                SuggestionId = req.SuggestionId.Value,
                UserId = userId,
                CastAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync();
        }
        else if (existing.SuggestionId == req.SuggestionId.Value)
        {
            // Tapping own vote clears it
            db.Votes.Remove(existing);
            await db.SaveChangesAsync();
        }
        else
        {
            existing.SuggestionId = req.SuggestionId.Value;
            existing.CastAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }

        var tallies = await BuildTallies(sessionId, userId, db);

        await hub.Clients.Group(SessionHub.GroupName(sessionId))
            .VoteChanged(new { sessionId, tallies });

        return Results.Ok(new { tallies });
    }

    internal static async Task<List<TallyEntry>> BuildTallies(Guid sessionId, Guid requestUserId, AppDbContext db)
    {
        var votes = await db.Votes.AsNoTracking()
            .Where(v => v.SessionId == sessionId)
            .ToListAsync();

        var suggestions = await db.Suggestions.AsNoTracking()
            .Where(s => s.SessionId == sessionId && s.WithdrawnAt == null)
            .Select(s => s.Id)
            .ToListAsync();

        return suggestions.Select(suggId => new TallyEntry(
            suggId,
            votes.Count(v => v.SuggestionId == suggId),
            votes.Any(v => v.SuggestionId == suggId && v.UserId == requestUserId)
        )).ToList();
    }
}
