using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Endpoints;

public static class InviteEndpoints
{
    private record InviteResponse(Guid Id, string TokenPrefix, string Url, DateTime ExpiresAt, DateTime? RevokedAt, Guid CreatedBy, DateTime CreatedAt);
    private record InvitePreview(string TeamName, int MemberCount, Guid TeamId, bool IsValid);

    public static IEndpointRouteBuilder MapInviteEndpoints(this IEndpointRouteBuilder app)
    {
        var teamInvites = app.MapGroup("/teams/{teamId:guid}/invites")
            .WithTags("Invites")
            .RequireAuthorization();

        teamInvites.MapPost("/", CreateInvite).RequireTeamMembership(MembershipRole.Admin);
        teamInvites.MapGet("/", ListInvites).RequireTeamMembership();

        var invites = app.MapGroup("/invites").WithTags("Invites");

        invites.MapGet("/{token}", GetInvitePreview).RequireRateLimiting("invite-lookup");
        invites.MapPost("/{token}/accept", AcceptInvite).RequireAuthorization();
        invites.MapPost("/{inviteId:guid}/revoke", RevokeInvite).RequireAuthorization();

        return app;
    }

    private static async Task<IResult> CreateInvite(
        Guid teamId,
        HttpContext ctx,
        AppDbContext db,
        AuthOptions authOpts)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var team = await db.Teams.FindAsync(teamId);
        if (team is null) return Results.NotFound();

        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

        var invite = new Invite
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedBy = userId,
        };

        db.Invites.Add(invite);
        await db.SaveChangesAsync();

        var url = $"{authOpts.PublicBaseUrl}/invites/{token}";
        return Results.Created($"/invites/{token}", ToResponse(invite, url));
    }

    private static async Task<IResult> ListInvites(
        Guid teamId,
        HttpContext ctx,
        AppDbContext db,
        AuthOptions authOpts)
    {
        var invites = await db.Invites
            .AsNoTracking()
            .Where(i => i.TeamId == teamId)
            .OrderByDescending(i => i.ExpiresAt)
            .ToListAsync();

        var result = invites.Select(i => ToResponse(i, $"{authOpts.PublicBaseUrl}/invites/{i.Token}"));
        return Results.Ok(result);
    }

    private static async Task<IResult> GetInvitePreview(
        string token,
        AppDbContext db)
    {
        var invite = await db.Invites
            .AsNoTracking()
            .Include(i => i.Team)
            .FirstOrDefaultAsync(i => i.Token == token);

        if (invite is null)
            return Results.Ok(new InvitePreview("", 0, Guid.Empty, false));

        var isValid = invite.RevokedAt is null && invite.ExpiresAt > DateTime.UtcNow;
        var memberCount = await db.Memberships.CountAsync(m => m.TeamId == invite.TeamId);

        return Results.Ok(new InvitePreview(invite.Team.Name, memberCount, invite.TeamId, isValid));
    }

    private static async Task<IResult> AcceptInvite(
        string token,
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var invite = await db.Invites
            .Include(i => i.Team)
            .FirstOrDefaultAsync(i => i.Token == token);

        if (invite is null || invite.RevokedAt is not null || invite.ExpiresAt <= DateTime.UtcNow)
            return Results.Problem(
                title: "Invite no longer valid",
                detail: "This invite link has expired or been revoked.",
                statusCode: StatusCodes.Status410Gone);

        var existing = await db.Memberships.FindAsync(userId, invite.TeamId);
        if (existing is not null)
            return Results.Ok(new { teamId = invite.TeamId });

        var membership = new Membership
        {
            UserId = userId,
            TeamId = invite.TeamId,
            Role = MembershipRole.Member,
            JoinedAt = DateTime.UtcNow,
        };
        db.Memberships.Add(membership);
        await db.SaveChangesAsync();

        return Results.Ok(new { teamId = invite.TeamId });
    }

    private static async Task<IResult> RevokeInvite(
        Guid inviteId,
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var invite = await db.Invites.FindAsync(inviteId);
        if (invite is null) return Results.NotFound();

        var membership = await db.Memberships
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.UserId == userId && m.TeamId == invite.TeamId);

        if (membership is null) return Results.Forbid();

        var isAdminOrOwner = membership.Role is MembershipRole.Admin or MembershipRole.Owner;
        if (!isAdminOrOwner) return Results.Forbid();

        if (invite.RevokedAt is not null)
            return Results.NoContent();

        invite.RevokedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Results.NoContent();
    }

    private static InviteResponse ToResponse(Invite i, string url) =>
        new(i.Id, i.Token[..8] + "…", url, i.ExpiresAt, i.RevokedAt, i.CreatedBy, i.ExpiresAt.AddDays(-7));
}
