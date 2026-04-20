using Microsoft.AspNetCore.Authorization;

namespace QuorumQ.Api.Auth;

public class TeamMembershipRequirement : IAuthorizationRequirement { }

public class TeamMembershipHandler : AuthorizationHandler<TeamMembershipRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        TeamMembershipRequirement requirement)
    {
        // Fleshed out by T-015
        return Task.CompletedTask;
    }
}
