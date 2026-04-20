using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Auth;

public class TeamMembershipRequirement : IAuthorizationRequirement
{
    public MembershipRole? RequiredRole { get; init; }
}

public class TeamMembershipHandler : AuthorizationHandler<TeamMembershipRequirement>
{
    private readonly AppDbContext _db;

    public TeamMembershipHandler(AppDbContext db) => _db = db;

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        TeamMembershipRequirement requirement)
    {
        if (context.Resource is not HttpContext httpContext) return;

        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId)) return;

        var routeTeamId = httpContext.GetRouteValue("teamId")?.ToString();
        if (!Guid.TryParse(routeTeamId, out var teamId)) return;

        var membership = await _db.Memberships
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.UserId == userId && m.TeamId == teamId);

        if (membership is null) return;

        if (requirement.RequiredRole is not null && membership.Role != requirement.RequiredRole)
        {
            var hasElevated = requirement.RequiredRole == MembershipRole.Admin
                ? membership.Role == MembershipRole.Owner
                : membership.Role == MembershipRole.Owner;
            if (!hasElevated) return;
        }

        context.Succeed(requirement);
    }
}

public static class TeamMembershipExtensions
{
    public static RouteHandlerBuilder RequireTeamMembership(
        this RouteHandlerBuilder builder,
        MembershipRole? role = null)
    {
        var policyName = role switch
        {
            MembershipRole.Owner => "TeamOwner",
            MembershipRole.Admin => "TeamAdmin",
            _ => "TeamMember",
        };
        return builder.RequireAuthorization(policyName);
    }
}
