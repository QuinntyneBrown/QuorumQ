using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;

namespace QuorumQ.Api.Hubs;

public interface ITeamNotificationClient
{
    Task SessionEvent(object payload);
}

[Authorize]
public class TeamNotificationHub : Hub<ITeamNotificationClient>
{
    private readonly AppDbContext _db;

    public TeamNotificationHub(AppDbContext db) => _db = db;

    public static string GroupName(Guid teamId) => $"team:{teamId}";

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

        var isMember = await _db.Memberships
            .AsNoTracking()
            .AnyAsync(m => m.UserId == userId && m.TeamId == teamId);

        if (!isMember)
        {
            Context.Abort();
            return;
        }

        Context.Items["teamId"] = teamId;
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(teamId));
        await base.OnConnectedAsync();
    }

    public static async Task SendToNonMutedMembersAsync(
        AppDbContext db,
        IHubContext<TeamNotificationHub, ITeamNotificationClient> hub,
        Guid teamId,
        object payload,
        CancellationToken ct = default)
    {
        var memberIds = await db.Memberships
            .AsNoTracking()
            .Where(m => m.TeamId == teamId)
            .Select(m => m.UserId)
            .ToListAsync(ct);

        var mutedIds = await db.NotificationPreferences
            .AsNoTracking()
            .Where(p => p.TeamId == teamId && p.Muted && memberIds.Contains(p.UserId))
            .Select(p => p.UserId)
            .ToHashSetAsync(ct);

        foreach (var userId in memberIds.Where(id => !mutedIds.Contains(id)))
        {
            await hub.Clients.User(userId.ToString()).SessionEvent(payload);
        }
    }
}
