using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Hubs;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Data;

public sealed class SessionDeadlineWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SessionDeadlineWorker> _logger;

    public SessionDeadlineWorker(IServiceScopeFactory scopeFactory, ILogger<SessionDeadlineWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));
        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await TransitionExpiredSessionsAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Error transitioning expired sessions");
            }
        }
    }

    private async Task TransitionExpiredSessionsAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hub = scope.ServiceProvider.GetRequiredService<IHubContext<SessionHub, ISessionHubClient>>();

        var now = DateTime.UtcNow;

        // 1. Regular Voting deadline
        var expiredVoting = await db.LunchSessions
            .Where(s => s.State == SessionState.Voting && s.TieBreakDeadline == null && s.Deadline <= now)
            .Include(s => s.Votes)
            .Include(s => s.Suggestions)
            .ToListAsync(ct);

        foreach (var session in expiredVoting)
        {
            await HandleVotingDeadline(session, now, db, hub);
        }

        // 2. Tie-break deadline
        var expiredTieBreaks = await db.LunchSessions
            .Where(s => s.State == SessionState.Voting && s.TieBreakDeadline != null && s.TieBreakDeadline <= now)
            .Include(s => s.Votes)
            .Include(s => s.Suggestions)
            .ToListAsync(ct);

        foreach (var session in expiredTieBreaks)
        {
            await HandleTieBreakDeadline(session, now, db, hub);
        }

        if (expiredVoting.Count + expiredTieBreaks.Count > 0)
            await db.SaveChangesAsync(ct);
    }

    private static async Task HandleVotingDeadline(
        LunchSession session, DateTime now, AppDbContext db,
        IHubContext<SessionHub, ISessionHubClient> hub)
    {
        var activeSuggestions = session.Suggestions.Where(s => s.WithdrawnAt == null).ToList();
        var tallies = session.Votes
            .Where(v => activeSuggestions.Any(s => s.Id == v.SuggestionId))
            .GroupBy(v => v.SuggestionId)
            .Select(g => (SuggestionId: g.Key, Count: g.Count()))
            .OrderByDescending(x => x.Count)
            .ToList();

        var topCount = tallies.FirstOrDefault().Count;

        // Build tied list: either top-voted or all (when 0 votes)
        List<Guid> tiedIds;
        if (topCount == 0)
        {
            tiedIds = activeSuggestions.Select(s => s.Id).ToList();
        }
        else
        {
            tiedIds = tallies.Where(x => x.Count == topCount).Select(x => x.SuggestionId).ToList();
        }

        if (tiedIds.Count == 1)
        {
            // Clear winner
            session.State = SessionState.Decided;
            session.DecidedAt = now;
            session.WinnerSuggestionId = tiedIds[0];

            await hub.Clients.Group(SessionHub.GroupName(session.Id))
                .Decided(new { sessionId = session.Id, state = "Decided", winnerId = tiedIds[0] });
        }
        else
        {
            // Start tie-break
            session.TieBreakDeadline = now.AddMinutes(2);
            session.TiedSuggestionIdsJson = JsonSerializer.Serialize(tiedIds);

            // Clear votes for non-tied suggestions
            var nonTiedVotes = session.Votes.Where(v => !tiedIds.Contains(v.SuggestionId)).ToList();
            db.Votes.RemoveRange(nonTiedVotes);

            await hub.Clients.Group(SessionHub.GroupName(session.Id))
                .TieBreakStarted(new
                {
                    sessionId = session.Id,
                    tiedSuggestionIds = tiedIds,
                    tieBreakDeadline = session.TieBreakDeadline,
                });
        }
    }

    private static async Task HandleTieBreakDeadline(
        LunchSession session, DateTime now, AppDbContext db,
        IHubContext<SessionHub, ISessionHubClient> hub)
    {
        var tiedIds = session.TiedSuggestionIdsJson is not null
            ? JsonSerializer.Deserialize<List<Guid>>(session.TiedSuggestionIdsJson) ?? []
            : session.Suggestions.Where(s => s.WithdrawnAt == null).Select(s => s.Id).ToList();

        var tallies = session.Votes
            .Where(v => tiedIds.Contains(v.SuggestionId))
            .GroupBy(v => v.SuggestionId)
            .Select(g => (SuggestionId: g.Key, Count: g.Count()))
            .OrderByDescending(x => x.Count)
            .ToList();

        var topCount = tallies.FirstOrDefault().Count;
        List<Guid> topIds = topCount > 0
            ? tallies.Where(x => x.Count == topCount).Select(x => x.SuggestionId).ToList()
            : tiedIds;

        Guid winnerId;
        bool chosenAtRandom;

        if (topIds.Count == 1)
        {
            winnerId = topIds[0];
            chosenAtRandom = false;
        }
        else
        {
            winnerId = topIds[Random.Shared.Next(topIds.Count)];
            chosenAtRandom = true;
        }

        session.State = SessionState.Decided;
        session.DecidedAt = now;
        session.WinnerSuggestionId = winnerId;
        session.WinnerChosenAtRandom = chosenAtRandom;

        await hub.Clients.Group(SessionHub.GroupName(session.Id))
            .Decided(new { sessionId = session.Id, state = "Decided", winnerId, chosenAtRandom });
    }
}
