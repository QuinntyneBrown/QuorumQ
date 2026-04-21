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
        var changed = false;

        // Phase 1: voting deadline expired, no tie-break in progress yet
        var expiredVoting = await db.LunchSessions
            .Where(s => s.State == SessionState.Voting && s.TieBreakDeadline == null && s.Deadline <= now)
            .Include(s => s.Votes)
            .Include(s => s.Suggestions)
            .ToListAsync(ct);

        foreach (var session in expiredVoting)
        {
            var activeSuggIds = session.Suggestions
                .Where(sg => sg.WithdrawnAt == null)
                .Select(sg => sg.Id)
                .ToHashSet();

            var groups = session.Votes
                .Where(v => activeSuggIds.Contains(v.SuggestionId))
                .GroupBy(v => v.SuggestionId)
                .Select(g => (SuggestionId: g.Key, Count: g.Count()))
                .OrderByDescending(x => x.Count)
                .ToList();

            if (groups.Count == 0)
            {
                // No votes — pick random from active suggestions (or null)
                var candidates = activeSuggIds.ToList();
                var winnerId = candidates.Count > 0
                    ? candidates[Random.Shared.Next(candidates.Count)]
                    : (Guid?)null;
                session.State = SessionState.Decided;
                session.DecidedAt = now;
                session.WinnerSuggestionId = winnerId;
                session.WinnerChosenAtRandom = winnerId.HasValue;
                await hub.Clients.Group(SessionHub.GroupName(session.Id))
                    .Decided(new { sessionId = session.Id, state = "Decided", winnerId, chosenAtRandom = session.WinnerChosenAtRandom });
            }
            else
            {
                var maxCount = groups[0].Count;
                var tied = groups.Where(x => x.Count == maxCount).Select(x => x.SuggestionId).ToList();

                if (tied.Count == 1)
                {
                    session.State = SessionState.Decided;
                    session.DecidedAt = now;
                    session.WinnerSuggestionId = tied[0];
                    await hub.Clients.Group(SessionHub.GroupName(session.Id))
                        .Decided(new { sessionId = session.Id, state = "Decided", winnerId = tied[0], chosenAtRandom = false });
                }
                else
                {
                    // Tie — enter tie-break round
                    session.TieBreakDeadline = now.AddMinutes(2);
                    session.TiedSuggestionIds = JsonSerializer.Serialize(tied);

                    // Clear votes for non-tied suggestions
                    var nonTiedVotes = session.Votes.Where(v => !tied.Contains(v.SuggestionId)).ToList();
                    db.Votes.RemoveRange(nonTiedVotes);

                    await hub.Clients.Group(SessionHub.GroupName(session.Id))
                        .TieBreakStarted(new { sessionId = session.Id, tiedSuggestionIds = tied, deadline = session.TieBreakDeadline });
                }
            }
            changed = true;
        }

        // Phase 2: tie-break deadline expired
        var expiredTieBreak = await db.LunchSessions
            .Where(s => s.State == SessionState.Voting && s.TieBreakDeadline != null && s.TieBreakDeadline <= now)
            .Include(s => s.Votes)
            .ToListAsync(ct);

        foreach (var session in expiredTieBreak)
        {
            var tiedIds = !string.IsNullOrEmpty(session.TiedSuggestionIds)
                ? JsonSerializer.Deserialize<List<Guid>>(session.TiedSuggestionIds)!
                : new List<Guid>();

            var groups = session.Votes
                .Where(v => tiedIds.Contains(v.SuggestionId))
                .GroupBy(v => v.SuggestionId)
                .Select(g => (SuggestionId: g.Key, Count: g.Count()))
                .OrderByDescending(x => x.Count)
                .ToList();

            Guid? winnerId;
            bool chosenAtRandom;

            if (groups.Count > 0)
            {
                var maxCount = groups[0].Count;
                var leaders = groups.Where(x => x.Count == maxCount).Select(x => x.SuggestionId).ToList();
                if (leaders.Count == 1)
                {
                    winnerId = leaders[0];
                    chosenAtRandom = false;
                }
                else
                {
                    winnerId = leaders[Random.Shared.Next(leaders.Count)];
                    chosenAtRandom = true;
                }
            }
            else
            {
                // No votes in tie-break — pick random from tied candidates
                winnerId = tiedIds.Count > 0 ? tiedIds[Random.Shared.Next(tiedIds.Count)] : (Guid?)null;
                chosenAtRandom = winnerId.HasValue;
            }

            session.State = SessionState.Decided;
            session.DecidedAt = now;
            session.WinnerSuggestionId = winnerId;
            session.WinnerChosenAtRandom = chosenAtRandom;

            await hub.Clients.Group(SessionHub.GroupName(session.Id))
                .Decided(new { sessionId = session.Id, state = "Decided", winnerId, chosenAtRandom });

            changed = true;
        }

        if (changed)
            await db.SaveChangesAsync(ct);
    }
}
