using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;

namespace QuorumQ.Api.Hubs;

[Authorize]
public class SessionHub : Hub
{
    private readonly AppDbContext _db;

    public SessionHub(AppDbContext db) => _db = db;

    public override async Task OnConnectedAsync()
    {
        var teamIdStr = Context.GetHttpContext()?.Request.Query["teamId"].ToString();
        if (!Guid.TryParse(teamIdStr, out var teamId))
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

        var isMember = await _db.Memberships.AnyAsync(m => m.UserId == userId && m.TeamId == teamId);
        if (!isMember)
        {
            Context.Abort();
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"team:{teamId}");
        await base.OnConnectedAsync();
    }

    protected async Task<bool> AssertSessionMemberAsync(Guid sessionId)
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return false;

        var session = await _db.LunchSessions.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session is null) return false;

        return await _db.Memberships.AnyAsync(m => m.UserId == userId && m.TeamId == session.TeamId);
    }
}
