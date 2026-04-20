using Microsoft.EntityFrameworkCore;
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

        var now = DateTime.UtcNow;
        var expiredVoting = await db.LunchSessions
            .Where(s => s.State == SessionState.Voting && s.Deadline <= now)
            .Include(s => s.Votes)
            .ToListAsync(ct);

        foreach (var session in expiredVoting)
        {
            var winnerId = session.Votes
                .GroupBy(v => v.SuggestionId)
                .OrderByDescending(g => g.Count())
                .Select(g => (Guid?)g.Key)
                .FirstOrDefault();

            session.State = SessionState.Decided;
            session.DecidedAt = now;
            session.WinnerSuggestionId = winnerId;
        }

        if (expiredVoting.Count > 0)
            await db.SaveChangesAsync(ct);
    }
}
