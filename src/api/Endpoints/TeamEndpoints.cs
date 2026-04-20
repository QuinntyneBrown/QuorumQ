using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Endpoints;

public static class TeamEndpoints
{
    private record CreateTeamRequest(string Name, string? Description);

    private record TeamSummary(
        Guid Id,
        string Name,
        string? Description,
        Guid OwnerId,
        DateTime CreatedAt,
        string CallerRole,
        int MemberCount,
        int UnreadCount = 0);

    public static IEndpointRouteBuilder MapTeamEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/teams")
            .WithTags("Teams")
            .RequireAuthorization();

        group.MapPost("/", CreateTeam);
        group.MapGet("/", ListTeams);
        group.MapGet("/{teamId:guid}", GetTeam).RequireTeamMembership();

        return app;
    }

    private static async Task<IResult> ListTeams(
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Results.Unauthorized();

        var memberships = await db.Memberships
            .AsNoTracking()
            .Where(m => m.UserId == userId)
            .Include(m => m.Team)
            .ToListAsync();

        var summaries = memberships.Select(m => new TeamSummary(
            m.Team.Id, m.Team.Name, m.Team.Description, m.Team.OwnerId, m.Team.CreatedAt,
            m.Role.ToString(),
            db.Memberships.Count(x => x.TeamId == m.TeamId)));

        return Results.Ok(summaries);
    }

    private static async Task<IResult> CreateTeam(
        [FromBody] CreateTeamRequest req,
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Results.Unauthorized();

        var user = await db.Users.FindAsync(userId);
        if (user is null) return Results.Unauthorized();

        if (user.EmailVerifiedAt is null)
            return Results.Problem(
                title: "Email not verified",
                detail: "Verify your email before creating a team.",
                statusCode: StatusCodes.Status403Forbidden);

        var name = req.Name?.Trim() ?? "";
        if (name.Length < 3 || name.Length > 50)
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["name"] = ["Team name must be 3–50 characters."]
            });

        var team = new Team
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = req.Description?.Trim(),
            OwnerId = userId,
            CreatedAt = DateTime.UtcNow,
        };
        var membership = new Membership
        {
            UserId = userId,
            TeamId = team.Id,
            Role = MembershipRole.Owner,
            JoinedAt = DateTime.UtcNow,
        };

        db.Teams.Add(team);
        db.Memberships.Add(membership);
        await db.SaveChangesAsync();

        var summary = new TeamSummary(
            team.Id, team.Name, team.Description, team.OwnerId, team.CreatedAt,
            "Owner", 1);

        return Results.Created($"/teams/{team.Id}", summary);
    }

    private static async Task<IResult> GetTeam(
        Guid teamId,
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Results.Unauthorized();

        var team = await db.Teams
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == teamId);

        if (team is null) return Results.NotFound();

        var membership = await db.Memberships
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.UserId == userId && m.TeamId == teamId);

        if (membership is null) return Results.Forbid();

        var memberCount = await db.Memberships
            .CountAsync(m => m.TeamId == teamId);

        var summary = new TeamSummary(
            team.Id, team.Name, team.Description, team.OwnerId, team.CreatedAt,
            membership.Role.ToString(), memberCount);

        return Results.Ok(summary);
    }
}
