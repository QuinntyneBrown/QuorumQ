using System.Security.Cryptography;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext context)
    {
        if (context.Users.Any()) return;

        var alice = new User
        {
            Id = Guid.Parse("11111111-0000-0000-0000-000000000001"),
            Email = "alice@example.com",
            PasswordHash = HashPassword("Password1!"),
            DisplayName = "Alice Demo",
            EmailVerifiedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };
        var bob = new User
        {
            Id = Guid.Parse("11111111-0000-0000-0000-000000000002"),
            Email = "bob@example.com",
            PasswordHash = HashPassword("Password1!"),
            DisplayName = "Bob Demo",
            EmailVerifiedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };
        context.Users.AddRange(alice, bob);

        var team = new Team
        {
            Id = Guid.Parse("22222222-0000-0000-0000-000000000001"),
            Name = "Demo Team",
            OwnerId = alice.Id,
            CreatedAt = DateTime.UtcNow,
        };
        context.Teams.Add(team);

        context.Memberships.AddRange(
            new Membership { UserId = alice.Id, TeamId = team.Id, Role = MembershipRole.Owner, JoinedAt = DateTime.UtcNow },
            new Membership { UserId = bob.Id,   TeamId = team.Id, Role = MembershipRole.Member, JoinedAt = DateTime.UtcNow }
        );

        var restaurant = new Restaurant
        {
            Id = Guid.Parse("33333333-0000-0000-0000-000000000001"),
            TeamId = team.Id,
            Name = "Pasta Palace",
            Cuisine = "Italian",
            CreatedBy = alice.Id,
            CreatedAt = DateTime.UtcNow,
        };
        context.Restaurants.Add(restaurant);

        var session = new LunchSession
        {
            Id = Guid.Parse("44444444-0000-0000-0000-000000000001"),
            TeamId = team.Id,
            State = SessionState.Decided,
            Deadline = DateTime.UtcNow.AddDays(-1),
            StartedBy = alice.Id,
            StartedAt = DateTime.UtcNow.AddDays(-1).AddHours(-2),
            DecidedAt = DateTime.UtcNow.AddDays(-1),
        };

        var suggestion = new Suggestion
        {
            Id = Guid.Parse("55555555-0000-0000-0000-000000000001"),
            SessionId = session.Id,
            RestaurantId = restaurant.Id,
            SuggestedBy = alice.Id,
            CreatedAt = session.StartedAt,
        };
        session.WinnerSuggestionId = suggestion.Id;

        context.LunchSessions.Add(session);
        context.Suggestions.Add(suggestion);

        context.Votes.AddRange(
            new Vote { Id = Guid.NewGuid(), SessionId = session.Id, SuggestionId = suggestion.Id, UserId = alice.Id, CastAt = session.DecidedAt!.Value.AddMinutes(-30) },
            new Vote { Id = Guid.NewGuid(), SessionId = session.Id, SuggestionId = suggestion.Id, UserId = bob.Id,   CastAt = session.DecidedAt!.Value.AddMinutes(-20) }
        );

        context.SaveChanges();
    }

    private static string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        return $"pbkdf2${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }
}
