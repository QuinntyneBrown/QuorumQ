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
    Task Decided(object payload);
    Task PresenceChanged(object payload);
}

[Authorize]
public class SessionHub : Hub<ISessionHubClient>
{
    private readonly AppDbContext _db;

    public SessionHub(AppDbContext db) => _db = db;

    public static string GroupName(Guid sessionId) => $"session:{sessionId}";

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

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(sessionId));
        await base.OnConnectedAsync();
    }

    public Task Ping() => Task.CompletedTask;
}
