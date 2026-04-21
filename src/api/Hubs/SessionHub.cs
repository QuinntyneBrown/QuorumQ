using System.Collections.Concurrent;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;

namespace QuorumQ.Api.Hubs;

public interface ISessionHubClient
{
    Task SuggestionAdded(object payload);
    Task SuggestionWithdrawn(object payload);
    Task VoteChanged(object payload);
    Task CommentAdded(object payload);
    Task CommentEdited(object payload);
    Task CommentDeleted(object payload);
    Task StateChanged(object payload);
    Task TieBreakStarted(object payload);
    Task Decided(object payload);
    Task PresenceChanged(object payload);
}

[Authorize]
public class SessionHub : Hub<ISessionHubClient>
{
    private static readonly ConcurrentDictionary<Guid, ConcurrentDictionary<Guid, byte>> _presence = new();
    private static readonly ConcurrentDictionary<string, CancellationTokenSource> _graceCts = new();

    private readonly AppDbContext _db;

    public SessionHub(AppDbContext db) => _db = db;

    public static string GroupName(Guid sessionId) => $"session:{sessionId}";

    public static IReadOnlyCollection<Guid> GetPresentUsers(Guid sessionId)
        => _presence.TryGetValue(sessionId, out var users)
            ? (IReadOnlyCollection<Guid>)users.Keys.ToList()
            : [];

    public override async Task OnConnectedAsync()
    {
        var sessionIdStr = Context.GetHttpContext()?.Request.Query["sessionId"].ToString();
        if (!Guid.TryParse(sessionIdStr, out var sessionId))
        {
            Context.Abort();
            return;
        }

        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            Context.Abort();
            return;
        }

        var session = await _db.LunchSessions.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session is null)
        {
            Context.Abort();
            return;
        }

        var isMember = await _db.Memberships.AnyAsync(m => m.UserId == userId && m.TeamId == session.TeamId);
        if (!isMember)
        {
            Context.Abort();
            return;
        }

        // Cancel any pending grace-period removal for this user
        var graceKey = $"{sessionId}:{userId}";
        if (_graceCts.TryRemove(graceKey, out var existingCts))
            existingCts.Cancel();

        // Add to presence map
        var sessionPresence = _presence.GetOrAdd(sessionId, _ => new ConcurrentDictionary<Guid, byte>());
        sessionPresence.TryAdd(userId, 0);
        Context.Items["sessionId"] = sessionId;
        Context.Items["userId"] = userId;

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(sessionId));
        await Clients.Group(GroupName(sessionId))
            .PresenceChanged(new { sessionId, presentUserIds = sessionPresence.Keys.ToArray() });

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.Items.TryGetValue("sessionId", out var rawSession) && rawSession is Guid sessionId
            && Context.Items.TryGetValue("userId", out var rawUser) && rawUser is Guid userId)
        {
            var graceKey = $"{sessionId}:{userId}";
            var cts = new CancellationTokenSource();
            _graceCts[graceKey] = cts;

            _ = Task.Run(async () =>
            {
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(30), cts.Token);
                    if (_presence.TryGetValue(sessionId, out var users))
                    {
                        users.TryRemove(userId, out _);
                        await Clients.Group(GroupName(sessionId))
                            .PresenceChanged(new { sessionId, presentUserIds = users.Keys.ToArray() });
                    }
                    _graceCts.TryRemove(graceKey, out _);
                }
                catch (OperationCanceledException) { }
            });
        }

        await base.OnDisconnectedAsync(exception);
    }

    public Task Ping() => Task.CompletedTask;

    public async Task LeaveSession()
    {
        await OnDisconnectedAsync(null);
    }
}
