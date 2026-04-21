using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Hubs;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Endpoints;

public static class SuggestionEndpoints
{
    private record SuggestRequest(string Name, string? Cuisine, string? Address, string? WebsiteUrl);

    private record SuggestionDto(
        Guid Id, Guid SessionId, Guid RestaurantId,
        string RestaurantName, string? Cuisine, string? Address, string? WebsiteUrl,
        Guid SuggestedBy, string SuggestedByName, DateTime CreatedAt, int VoteCount);

    private record DuplicatePayload(SuggestionDto ExistingSuggestion, string SuggestedBy);

    private record RestaurantSearchResult(Guid Id, string Name, string? Cuisine, string? Address, string? WebsiteUrl);

    public static IEndpointRouteBuilder MapSuggestionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/sessions/{sessionId:guid}/suggestions")
            .WithTags("Suggestions")
            .RequireAuthorization();

        group.MapPost("/", AddSuggestion);
        group.MapGet("/", GetSuggestions);

        var teamGroup = app.MapGroup("/teams/{teamId:guid}/restaurants")
            .WithTags("Suggestions")
            .RequireAuthorization();

        teamGroup.MapGet("/", SearchRestaurants).RequireTeamMembership();

        return app;
    }

    private static async Task<IResult> AddSuggestion(
        Guid sessionId,
        SuggestRequest req,
        HttpContext ctx,
        AppDbContext db,
        IHubContext<SessionHub, ISessionHubClient> hub)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        if (string.IsNullOrWhiteSpace(req.Name) || req.Name.Trim().Length < 2 || req.Name.Trim().Length > 80)
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["name"] = ["Name must be between 2 and 80 characters."]
            });

        var session = await db.LunchSessions.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session is null) return Results.NotFound();

        var isMember = await db.Memberships.AnyAsync(m => m.UserId == userId && m.TeamId == session.TeamId);
        if (!isMember) return Results.Forbid();

        if (session.State != SessionState.Suggesting)
            return Results.Problem("Suggestions are only accepted during the Suggesting phase.", statusCode: 409);

        var teamId = session.TeamId;
        var normalizedName = Normalize(req.Name);

        // Find or create restaurant scoped to the team
        var restaurant = await db.Restaurants
            .FirstOrDefaultAsync(r => r.TeamId == teamId && r.Name.ToLower() == normalizedName);

        if (restaurant is null)
        {
            restaurant = new Restaurant
            {
                Id = Guid.NewGuid(),
                TeamId = teamId,
                Name = req.Name.Trim(),
                Cuisine = req.Cuisine?.Trim(),
                Address = req.Address?.Trim(),
                WebsiteUrl = req.WebsiteUrl?.Trim(),
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
            };
            db.Restaurants.Add(restaurant);
            await db.SaveChangesAsync();
        }

        // Check for duplicate suggestion in this session
        var existing = await db.Suggestions
            .Include(s => s.Restaurant)
            .Include(s => s.Votes)
            .Where(s => s.SessionId == sessionId && s.RestaurantId == restaurant.Id && s.WithdrawnAt == null)
            .Select(s => new
            {
                Suggestion = s,
                SuggestedByName = db.Users
                    .Where(u => u.Id == s.SuggestedBy)
                    .Select(u => u.DisplayName)
                    .FirstOrDefault() ?? "Unknown",
                VoteCount = s.Votes.Count,
            })
            .FirstOrDefaultAsync();

        if (existing is not null)
        {
            var dto = ToDto(existing.Suggestion, existing.Suggestion.Restaurant, existing.SuggestedByName, existing.VoteCount);
            return Results.Conflict(new DuplicatePayload(dto, existing.SuggestedByName));
        }

        var suggestion = new Suggestion
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            RestaurantId = restaurant.Id,
            SuggestedBy = userId,
            CreatedAt = DateTime.UtcNow,
        };
        db.Suggestions.Add(suggestion);
        await db.SaveChangesAsync();

        var user = await db.Users.AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => u.DisplayName)
            .FirstOrDefaultAsync() ?? "Unknown";

        var responseDto = ToDto(suggestion, restaurant, user, 0);
        await hub.Clients.Group(SessionHub.GroupName(sessionId))
            .SuggestionAdded(responseDto);

        return Results.Created($"/sessions/{sessionId}/suggestions/{suggestion.Id}", responseDto);
    }

    private static async Task<IResult> GetSuggestions(Guid sessionId, AppDbContext db)
    {
        var suggestions = await db.Suggestions
            .AsNoTracking()
            .Include(s => s.Restaurant)
            .Include(s => s.Votes)
            .Where(s => s.SessionId == sessionId && s.WithdrawnAt == null)
            .OrderBy(s => s.CreatedAt)
            .Select(s => new
            {
                Suggestion = s,
                Restaurant = s.Restaurant,
                SuggestedByName = db.Users
                    .Where(u => u.Id == s.SuggestedBy)
                    .Select(u => u.DisplayName)
                    .FirstOrDefault() ?? "Unknown",
                VoteCount = s.Votes.Count,
            })
            .ToListAsync();

        var dtos = suggestions.Select(x => ToDto(x.Suggestion, x.Restaurant, x.SuggestedByName, x.VoteCount));
        return Results.Ok(dtos);
    }

    private static SuggestionDto ToDto(Suggestion s, Restaurant r, string suggestedByName, int voteCount) =>
        new(s.Id, s.SessionId, s.RestaurantId,
            r.Name, r.Cuisine, r.Address, r.WebsiteUrl,
            s.SuggestedBy, suggestedByName, s.CreatedAt, voteCount);

    private static async Task<IResult> SearchRestaurants(
        Guid teamId,
        string? query,
        AppDbContext db,
        int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
            return Results.Ok(Array.Empty<RestaurantSearchResult>());

        limit = Math.Clamp(limit, 1, 10);
        var q = query.Trim().ToLower();

        var results = await db.Restaurants
            .AsNoTracking()
            .Where(r => r.TeamId == teamId && r.Name.ToLower().Contains(q))
            .OrderByDescending(r => db.Suggestions
                .Where(s => s.RestaurantId == r.Id)
                .Max(s => (DateTime?)s.CreatedAt))
            .Take(limit)
            .Select(r => new RestaurantSearchResult(r.Id, r.Name, r.Cuisine, r.Address, r.WebsiteUrl))
            .ToListAsync();

        return Results.Ok(results);
    }

    private static string Normalize(string name) =>
        Regex.Replace(name.Trim().ToLower(), @"[^\w\s]", "").Trim();
}
