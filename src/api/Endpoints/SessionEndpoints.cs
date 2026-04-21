using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Hubs;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Endpoints;

public static class SessionEndpoints
{
    private record StartSessionRequest(int DeadlineMinutes = 45);

    private record TieBreakInfo(bool Active, Guid[] TiedSuggestionIds, DateTime? Deadline);

    private record SessionDetail(
        Guid Id, string TeamId, string State, DateTime Deadline, DateTime StartedAt,
        Guid StartedBy, int SuggestionCount, string? WinnerName, string? WinnerCuisine,
        bool WinnerChosenAtRandom, TieBreakInfo? TieBreak,
        string? DirectionsUrl, string? WebsiteUrl);

    public static IEndpointRouteBuilder MapSessionEndpoints(this IEndpointRouteBuilder app)
    {
        var teamGroup = app.MapGroup("/teams/{teamId:guid}/sessions")
            .WithTags("Sessions")
            .RequireAuthorization();

        teamGroup.MapPost("/", StartSession).RequireTeamMembership(MembershipRole.Admin);
        teamGroup.MapGet("/{sessionId:guid}", GetSession).RequireTeamMembership();

        var sessionGroup = app.MapGroup("/sessions")
            .WithTags("Sessions")
            .RequireAuthorization();

        sessionGroup.MapPost("/{sessionId:guid}/start-voting", StartVoting);
        sessionGroup.MapPost("/{sessionId:guid}/cancel", CancelSession);
        sessionGroup.MapDelete("/{sessionId:guid}", DeleteSession);
        sessionGroup.MapGet("/{sessionId:guid}/presence", GetPresence);

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

        if (req.DeadlineMinutes < 5 || req.DeadlineMinutes > 180)
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["deadlineMinutes"] = ["Deadline must be between 5 and 180 minutes."]
            });

        var existing = await db.LunchSessions
            .AsNoTracking()
            .Where(s => s.TeamId == teamId &&
                   (s.State == SessionState.Suggesting || s.State == SessionState.Voting))
            .Select(s => new SessionDetail(
                s.Id, s.TeamId.ToString(), s.State.ToString(), s.Deadline, s.StartedAt,
                s.StartedBy, s.Suggestions.Count(), null, null, false, null, null, null))
            .FirstOrDefaultAsync();

        if (existing is not null)
            return Results.Ok(existing);

        var session = new LunchSession
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            State = SessionState.Suggesting,
            Deadline = DateTime.UtcNow.AddMinutes(req.DeadlineMinutes),
            StartedBy = userId,
            StartedAt = DateTime.UtcNow,
        };

        db.LunchSessions.Add(session);
        await db.SaveChangesAsync();

        return Results.Created(
            $"/teams/{teamId}/sessions/{session.Id}",
            new SessionDetail(session.Id, teamId.ToString(), session.State.ToString(),
                session.Deadline, session.StartedAt, session.StartedBy, 0, null, null, false, null, null, null));
    }

    private static async Task<IResult> GetSession(
        Guid teamId,
        Guid sessionId,
        AppDbContext db)
    {
        var raw = await db.LunchSessions
            .AsNoTracking()
            .Include(s => s.Suggestions).ThenInclude(sg => sg.Restaurant)
            .Where(s => s.Id == sessionId && s.TeamId == teamId)
            .FirstOrDefaultAsync();

        if (raw is null) return Results.NotFound();

        var suggestionCount = raw.Suggestions.Count(s => s.WithdrawnAt == null);
        var winnerSuggestion = raw.WinnerSuggestionId is not null
            ? raw.Suggestions.FirstOrDefault(sg => sg.Id == raw.WinnerSuggestionId)
            : null;
        var winnerName = winnerSuggestion?.Restaurant?.Name;
        var winnerCuisine = winnerSuggestion?.Restaurant?.Cuisine;
        var winnerAddress = winnerSuggestion?.Restaurant?.Address;
        var winnerWebsiteUrl = winnerSuggestion?.Restaurant?.WebsiteUrl;

        TieBreakInfo? tieBreak = null;
        if (raw.State == SessionState.Voting && raw.TieBreakDeadline is not null)
        {
            var tiedIds = raw.TiedSuggestionIdsJson is not null
                ? JsonSerializer.Deserialize<Guid[]>(raw.TiedSuggestionIdsJson) ?? []
                : [];
            tieBreak = new TieBreakInfo(true, tiedIds, raw.TieBreakDeadline);
        }

        var directionsUrl = winnerAddress is not null
            ? $"https://maps.google.com/maps?q={Uri.EscapeDataString(winnerAddress)}"
            : null;

        var dto = new SessionDetail(raw.Id, raw.TeamId.ToString(), raw.State.ToString(),
            raw.Deadline, raw.StartedAt, raw.StartedBy, suggestionCount, winnerName, winnerCuisine,
            raw.WinnerChosenAtRandom, tieBreak, directionsUrl, winnerWebsiteUrl);

        return Results.Ok(dto);
    }

    private static async Task<IResult> StartVoting(
        Guid sessionId,
        HttpContext ctx,
        AppDbContext db,
        IHubContext<SessionHub, ISessionHubClient> hub)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var session = await db.LunchSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session is null) return Results.NotFound();
        if (session.StartedBy != userId) return Results.Forbid();
        if (session.State != SessionState.Suggesting)
            return Results.Problem("Session is not in Suggesting state.", statusCode: 409);

        session.State = SessionState.Voting;
        await db.SaveChangesAsync();

        var dto = new SessionDetail(session.Id, session.TeamId.ToString(), session.State.ToString(),
            session.Deadline, session.StartedAt, session.StartedBy, 0, null, null, false, null, null, null);
        await hub.Clients.Group(SessionHub.GroupName(sessionId))
            .StateChanged(new { sessionId, state = session.State.ToString() });

        return Results.Ok(dto);
    }

    private static async Task<IResult> CancelSession(
        Guid sessionId,
        HttpContext ctx,
        AppDbContext db,
        IHubContext<SessionHub, ISessionHubClient> hub)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var session = await db.LunchSessions.FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session is null) return Results.NotFound();
        if (session.StartedBy != userId) return Results.Forbid();
        if (session.State != SessionState.Suggesting && session.State != SessionState.Voting)
            return Results.Problem("Session is not in an active state.", statusCode: 409);

        session.State = SessionState.Cancelled;
        await db.SaveChangesAsync();

        var dto = new SessionDetail(session.Id, session.TeamId.ToString(), session.State.ToString(),
            session.Deadline, session.StartedAt, session.StartedBy, 0, null, null, false, null, null, null);
        await hub.Clients.Group(SessionHub.GroupName(sessionId))
            .StateChanged(new { sessionId, state = session.State.ToString() });

        return Results.Ok(dto);
    }

    private static async Task<IResult> DeleteSession(
        Guid sessionId,
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var session = await db.LunchSessions
            .Include(s => s.Team)
            .ThenInclude(t => t.Memberships)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session is null) return Results.NotFound();

        var membership = session.Team.Memberships.FirstOrDefault(m => m.UserId == userId);
        if (membership is null || (membership.Role != MembershipRole.Admin && membership.Role != MembershipRole.Owner))
            return Results.Forbid();

        db.LunchSessions.Remove(session);
        await db.SaveChangesAsync();

        return Results.NoContent();
    }

    private record PresenceUser(Guid Id, string DisplayName, string? AvatarUrl);

    private static async Task<IResult> GetPresence(
        Guid sessionId,
        AppDbContext db)
    {
        var presentIds = SessionHub.GetPresentUsers(sessionId);
        if (!presentIds.Any())
            return Results.Ok(Array.Empty<PresenceUser>());

        var users = await db.Users
            .AsNoTracking()
            .Where(u => presentIds.Contains(u.Id))
            .Select(u => new PresenceUser(u.Id, u.DisplayName, u.AvatarUrl))
            .ToListAsync();

        return Results.Ok(users);
    }
}
