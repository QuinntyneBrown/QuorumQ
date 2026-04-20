using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Tests;

public class AppDbContextSchemaTests : IAsyncLifetime
{
    private SqliteConnection _conn = null!;
    private AppDbContext _db = null!;

    public async Task InitializeAsync()
    {
        _conn = new SqliteConnection("Data Source=:memory:");
        _conn.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_conn)
            .Options;
        _db = new AppDbContext(options);
        await _db.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        await _db.DisposeAsync();
        _conn.Dispose();
    }

    [Fact(DisplayName = "[schema] unique indexes are present on votes and reviews")]
    public async Task UniqueIndexes_ArePresent_OnVotesAndReviews()
    {
        var userId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var restaurantId = Guid.NewGuid();
        var sessionId = Guid.NewGuid();
        var suggestionId = Guid.NewGuid();

        var user = new User { Id = userId, Email = "u@example.com", PasswordHash = "x", DisplayName = "U", CreatedAt = DateTime.UtcNow };
        var team = new Team { Id = teamId, Name = "T", OwnerId = userId, CreatedAt = DateTime.UtcNow };
        _db.Users.Add(user);
        _db.Teams.Add(team);
        await _db.SaveChangesAsync();

        var restaurant = new Restaurant { Id = restaurantId, TeamId = teamId, Name = "R", CreatedBy = userId, CreatedAt = DateTime.UtcNow };
        var session = new LunchSession { Id = sessionId, TeamId = teamId, State = SessionState.Voting, Deadline = DateTime.UtcNow.AddHours(1), StartedBy = userId, StartedAt = DateTime.UtcNow };
        _db.Restaurants.Add(restaurant);
        _db.LunchSessions.Add(session);
        await _db.SaveChangesAsync();

        var suggestion = new Suggestion { Id = suggestionId, SessionId = sessionId, RestaurantId = restaurantId, SuggestedBy = userId, CreatedAt = DateTime.UtcNow };
        _db.Suggestions.Add(suggestion);
        await _db.SaveChangesAsync();

        _db.Votes.Add(new Vote { SessionId = sessionId, SuggestionId = suggestionId, UserId = userId, CastAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();

        _db.Votes.Add(new Vote { SessionId = sessionId, SuggestionId = suggestionId, UserId = userId, CastAt = DateTime.UtcNow });
        await Assert.ThrowsAsync<DbUpdateException>(() => _db.SaveChangesAsync());

        _db.ChangeTracker.Clear();

        _db.Reviews.Add(new Review { SessionId = sessionId, RestaurantId = restaurantId, UserId = userId, Rating = 4, CreatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();

        _db.Reviews.Add(new Review { SessionId = sessionId, RestaurantId = restaurantId, UserId = userId, Rating = 3, CreatedAt = DateTime.UtcNow });
        await Assert.ThrowsAsync<DbUpdateException>(() => _db.SaveChangesAsync());
    }

    [Fact(DisplayName = "[schema] soft-deleted users are filtered by default")]
    public async Task SoftDeletedUsers_AreFiltered_ByDefault()
    {
        var active  = new User { Email = "active@example.com",  PasswordHash = "x", DisplayName = "Active" };
        var deleted = new User { Email = "deleted@example.com", PasswordHash = "x", DisplayName = "Deleted", DeletedAt = DateTime.UtcNow };

        _db.Users.Add(active);
        _db.Users.Add(deleted);
        await _db.SaveChangesAsync();
        _db.ChangeTracker.Clear();

        var visible = await _db.Users.ToListAsync();
        Assert.Single(visible);
        Assert.Equal("active@example.com", visible[0].Email);

        var all = await _db.Users.IgnoreQueryFilters().ToListAsync();
        Assert.Equal(2, all.Count);
    }
}
