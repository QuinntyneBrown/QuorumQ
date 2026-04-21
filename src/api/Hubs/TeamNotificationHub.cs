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
}
