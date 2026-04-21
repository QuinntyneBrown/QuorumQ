using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Endpoints;

public static class ReviewEndpoints
{
    private record UpsertReviewRequest(int Rating, string? Body);
    private record ReviewAuthor(Guid Id, string DisplayName, string? AvatarUrl);
    private record ReviewDto(
        Guid Id, int Rating, string? Body, ReviewAuthor Author,
        DateTime CreatedAt, DateTime? UpdatedAt);
    private record MyReviewState(bool Participated, ReviewDto? Review);
    private record RestaurantReviewsDto(double? AverageRating, IReadOnlyList<ReviewDto> Reviews);
    private record RestaurantDetail(
        Guid Id, string Name, string? Cuisine, string? Address, string? WebsiteUrl,
        double? AverageRating, int ReviewCount, IReadOnlyList<ReviewDto> Reviews);

    public static IEndpointRouteBuilder MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var sessionGroup = app.MapGroup("/sessions")
            .WithTags("Reviews")
            .RequireAuthorization();

        sessionGroup.MapGet("/{sessionId:guid}/review", GetMyReview);
        sessionGroup.MapPut("/{sessionId:guid}/review", UpsertReview);

        var restaurantGroup = app.MapGroup("/restaurants")
            .WithTags("Reviews")
            .RequireAuthorization();

        restaurantGroup.MapGet("/{restaurantId:guid}/reviews", ListReviews);

        var teamRestaurantGroup = app.MapGroup("/teams/{teamId:guid}/restaurants")
            .WithTags("Reviews")
            .RequireAuthorization();

        teamRestaurantGroup.MapGet("/{restaurantId:guid}", GetRestaurantProfile)
            .RequireTeamMembership();

        return app;
    }

    private static async Task<IResult> GetMyReview(
        Guid sessionId,
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var participated = await CheckParticipation(db, sessionId, userId);

        var existing = await db.Reviews
            .AsNoTracking()
            .Where(r => r.SessionId == sessionId && r.UserId == userId)
            .Select(r => new ReviewDto(
                r.Id, r.Rating, r.Body,
                new ReviewAuthor(userId, "", null),
                r.CreatedAt, r.UpdatedAt))
            .FirstOrDefaultAsync();

        return Results.Ok(new MyReviewState(participated, existing));
    }

    private static async Task<IResult> UpsertReview(
        Guid sessionId,
        UpsertReviewRequest req,
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        if (req.Rating < 1 || req.Rating > 5)
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["rating"] = ["Rating must be between 1 and 5."]
            });

        var session = await db.LunchSessions
            .AsNoTracking()
            .Include(s => s.Suggestions)
            .FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session is null) return Results.NotFound();

        if (session.State != SessionState.Decided)
            return Results.Problem("Session has not yet been decided.", statusCode: 409);

        if (session.WinnerSuggestionId is null)
            return Results.Problem("Session has no winner.", statusCode: 409);

        var winnerSuggestion = session.Suggestions
            .FirstOrDefault(s => s.Id == session.WinnerSuggestionId);
        if (winnerSuggestion is null) return Results.NotFound();

        var participated = await CheckParticipation(db, sessionId, userId);
        if (!participated) return Results.Forbid();

        var restaurantId = winnerSuggestion.RestaurantId;

        var existing = await db.Reviews
            .FirstOrDefaultAsync(r => r.SessionId == sessionId && r.UserId == userId);

        if (existing is null)
        {
            existing = new Review
            {
                Id = Guid.NewGuid(),
                SessionId = sessionId,
                RestaurantId = restaurantId,
                UserId = userId,
                Rating = req.Rating,
                Body = req.Body,
                CreatedAt = DateTime.UtcNow,
            };
            db.Reviews.Add(existing);
        }
        else
        {
            existing.Rating = req.Rating;
            existing.Body = req.Body;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();

        var avg = await db.Reviews
            .Where(r => r.RestaurantId == restaurantId)
            .AverageAsync(r => (double)r.Rating);

        var restaurant = await db.Restaurants.FirstAsync(r => r.Id == restaurantId);
        restaurant.AverageRating = Math.Round(avg, 2);
        await db.SaveChangesAsync();

        var user = await db.Users.AsNoTracking()
            .Select(u => new { u.Id, u.DisplayName, u.AvatarUrl })
            .FirstOrDefaultAsync(u => u.Id == userId);

        var dto = new ReviewDto(
            existing.Id, existing.Rating, existing.Body,
            new ReviewAuthor(userId, user?.DisplayName ?? "", user?.AvatarUrl),
            existing.CreatedAt, existing.UpdatedAt);

        return Results.Ok(new { review = dto, averageRating = avg });
    }

    private static async Task<IResult> ListReviews(
        Guid restaurantId,
        AppDbContext db)
    {
        var restaurant = await db.Restaurants.AsNoTracking()
            .Select(r => new { r.Id, r.AverageRating })
            .FirstOrDefaultAsync(r => r.Id == restaurantId);
        if (restaurant is null) return Results.NotFound();

        var reviews = await db.Reviews
            .AsNoTracking()
            .Where(r => r.RestaurantId == restaurantId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new { r.Id, r.Rating, r.Body, r.CreatedAt, r.UpdatedAt, r.UserId })
            .ToListAsync();

        var userIds = reviews.Select(r => r.UserId).Distinct().ToList();
        var users = await db.Users
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new { u.Id, u.DisplayName, u.AvatarUrl, u.DeletedAt })
            .ToDictionaryAsync(u => u.Id);

        var dtos = reviews.Select(r =>
        {
            users.TryGetValue(r.UserId, out var user);
            var author = user is null || user.DeletedAt is not null
                ? new ReviewAuthor(Guid.Empty, "[deleted user]", null)
                : new ReviewAuthor(user.Id, user.DisplayName, user.AvatarUrl);
            return new ReviewDto(r.Id, r.Rating, r.Body, author, r.CreatedAt, r.UpdatedAt);
        }).ToList();

        return Results.Ok(new RestaurantReviewsDto(restaurant.AverageRating, dtos));
    }

    private static async Task<IResult> GetRestaurantProfile(
        Guid teamId,
        Guid restaurantId,
        AppDbContext db)
    {
        var restaurant = await db.Restaurants.AsNoTracking()
            .Where(r => r.Id == restaurantId && r.TeamId == teamId)
            .Select(r => new { r.Id, r.Name, r.Cuisine, r.Address, r.WebsiteUrl, r.AverageRating })
            .FirstOrDefaultAsync();
        if (restaurant is null) return Results.NotFound();

        var rawReviews = await db.Reviews
            .AsNoTracking()
            .Where(r => r.RestaurantId == restaurantId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new { r.Id, r.Rating, r.Body, r.CreatedAt, r.UpdatedAt, r.UserId })
            .ToListAsync();

        var userIds = rawReviews.Select(r => r.UserId).Distinct().ToList();
        var users = await db.Users
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new { u.Id, u.DisplayName, u.AvatarUrl, u.DeletedAt })
            .ToDictionaryAsync(u => u.Id);

        var reviews = rawReviews.Select(r =>
        {
            users.TryGetValue(r.UserId, out var user);
            var author = user is null || user.DeletedAt is not null
                ? new ReviewAuthor(Guid.Empty, "[deleted user]", null)
                : new ReviewAuthor(user.Id, user.DisplayName, user.AvatarUrl);
            return new ReviewDto(r.Id, r.Rating, r.Body, author, r.CreatedAt, r.UpdatedAt);
        }).ToList();

        return Results.Ok(new RestaurantDetail(
            restaurant.Id, restaurant.Name, restaurant.Cuisine,
            restaurant.Address, restaurant.WebsiteUrl,
            restaurant.AverageRating, reviews.Count, reviews));
    }

    private static async Task<bool> CheckParticipation(AppDbContext db, Guid sessionId, Guid userId) =>
        await db.Votes.AnyAsync(v => v.SessionId == sessionId && v.UserId == userId)
        || await db.Suggestions.AnyAsync(s => s.SessionId == sessionId && s.SuggestedBy == userId);
}
