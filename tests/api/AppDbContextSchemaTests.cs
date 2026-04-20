using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Tests;

public class AppDbContextSchemaTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite("Data Source=:memory:")
            .Options;
        var ctx = new AppDbContext(options);
        ctx.Database.OpenConnection();
        ctx.Database.EnsureCreated();
        return ctx;
    }

    [Fact(DisplayName = "[schema] unique indexes are present on votes and reviews")]
    public async Task UniqueIndexes_OnVotesAndReviews()
    {
        await using var ctx = CreateContext();

        var userId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var sessionId = Guid.NewGuid();
        var restaurantId = Guid.NewGuid();
        var suggestionId = Guid.NewGuid();

        ctx.Users.Add(new User { Id = userId, Email = "u@test.com", DisplayName = "U", PasswordHash = "x", CreatedAt = DateTime.UtcNow });
        ctx.Teams.Add(new Team { Id = teamId, Name = "T", OwnerId = userId, CreatedAt = DateTime.UtcNow });
        ctx.Memberships.Add(new Membership { UserId = userId, TeamId = teamId, Role = MembershipRole.Owner, JoinedAt = DateTime.UtcNow });
        ctx.Restaurants.Add(new Restaurant { Id = restaurantId, TeamId = teamId, Name = "R", CreatedBy = userId, CreatedAt = DateTime.UtcNow });
        ctx.Sessions.Add(new LunchSession { Id = sessionId, TeamId = teamId, State = SessionState.Voting, Deadline = DateTime.UtcNow.AddHours(1), StartedBy = userId, StartedAt = DateTime.UtcNow });
        ctx.Suggestions.Add(new Suggestion { Id = suggestionId, SessionId = sessionId, RestaurantId = restaurantId, SuggestedBy = userId, CreatedAt = DateTime.UtcNow });
        await ctx.SaveChangesAsync();

        // First vote — should succeed
        ctx.Votes.Add(new Vote { Id = Guid.NewGuid(), SessionId = sessionId, SuggestionId = suggestionId, UserId = userId, CastAt = DateTime.UtcNow });
        await ctx.SaveChangesAsync();

        // Duplicate vote — must throw
        ctx.Votes.Add(new Vote { Id = Guid.NewGuid(), SessionId = sessionId, SuggestionId = suggestionId, UserId = userId, CastAt = DateTime.UtcNow });
        await Assert.ThrowsAsync<DbUpdateException>(() => ctx.SaveChangesAsync());
    }

    [Fact(DisplayName = "[schema] soft-deleted users are filtered by default")]
    public async Task SoftDeleteFilter_ExcludesDeletedUsers()
    {
        await using var ctx = CreateContext();

        var activeId = Guid.NewGuid();
        var deletedId = Guid.NewGuid();
        ctx.Users.AddRange(
            new User { Id = activeId, Email = "active@test.com", DisplayName = "Active", PasswordHash = "x", CreatedAt = DateTime.UtcNow },
            new User { Id = deletedId, Email = "deleted@test.com", DisplayName = "Deleted", PasswordHash = "x", CreatedAt = DateTime.UtcNow, DeletedAt = DateTime.UtcNow }
        );
        await ctx.SaveChangesAsync();

        var visible = await ctx.Users.ToListAsync();
        Assert.Single(visible);
        Assert.Equal(activeId, visible[0].Id);
    }
}
