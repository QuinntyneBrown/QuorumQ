using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using QuorumQ.Api.Models;
using System.Security.Cryptography;

namespace QuorumQ.Api.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext context)
    {
        if (context.Users.Any()) return;

        var alice = new User
        {
            Id = Guid.NewGuid(),
            Email = "alice@example.com",
            PasswordHash = HashPassword("Password1!"),
            DisplayName = "Alice",
            EmailVerifiedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };
        var bob = new User
        {
            Id = Guid.NewGuid(),
            Email = "bob@example.com",
            PasswordHash = HashPassword("Password1!"),
            DisplayName = "Bob",
            EmailVerifiedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };
        context.Users.AddRange(alice, bob);

        var team = new Team
        {
            Id = Guid.NewGuid(),
            Name = "Demo Team",
            Description = "Seeded demo team",
            OwnerId = alice.Id,
            CreatedAt = DateTime.UtcNow,
        };
        context.Teams.Add(team);

        context.Memberships.AddRange(
            new Membership { UserId = alice.Id, TeamId = team.Id, Role = MembershipRole.Owner, JoinedAt = DateTime.UtcNow },
            new Membership { UserId = bob.Id, TeamId = team.Id, Role = MembershipRole.Member, JoinedAt = DateTime.UtcNow }
        );

        var restaurant = new Restaurant
        {
            Id = Guid.NewGuid(),
            TeamId = team.Id,
            Name = "The Green Fork",
            Cuisine = "Contemporary",
            CreatedBy = alice.Id,
            CreatedAt = DateTime.UtcNow,
        };
        context.Restaurants.Add(restaurant);

        var session = new LunchSession
        {
            Id = Guid.NewGuid(),
            TeamId = team.Id,
            State = SessionState.Decided,
            Deadline = DateTime.UtcNow.AddDays(-1),
            StartedBy = alice.Id,
            StartedAt = DateTime.UtcNow.AddDays(-1).AddHours(-2),
            DecidedAt = DateTime.UtcNow.AddDays(-1),
            WinnerChosenAtRandom = false,
        };
        context.Sessions.Add(session);

        var suggestion = new Suggestion
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            RestaurantId = restaurant.Id,
            SuggestedBy = alice.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-1).AddHours(-1),
        };
        context.Suggestions.Add(suggestion);
        session.WinnerSuggestionId = suggestion.Id;

        context.Votes.AddRange(
            new Vote { Id = Guid.NewGuid(), SessionId = session.Id, SuggestionId = suggestion.Id, UserId = alice.Id, CastAt = DateTime.UtcNow.AddDays(-1) },
            new Vote { Id = Guid.NewGuid(), SessionId = session.Id, SuggestionId = suggestion.Id, UserId = bob.Id, CastAt = DateTime.UtcNow.AddDays(-1) }
        );

        context.SaveChanges();
    }

    private static string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        byte[] hash = KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA256, 100_000, 32);
        return $"pbkdf2${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }
}
