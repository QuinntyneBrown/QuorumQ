using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Auth;
using QuorumQ.Api.Data;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Endpoints;

public static class HistoryEndpoints
{
    private record TallyEntry(Guid RestaurantId, string Name, int Votes);

    private record HistoryItem(
        Guid SessionId, DateTime Date, string? Winner,
        IReadOnlyList<TallyEntry> Tally, int ParticipantCount);

    private record PagedHistory(
        IReadOnlyList<HistoryItem> Items, int TotalCount, int Page, int PageSize);

    private record CommentAuthorSummary(Guid Id, string DisplayName, string? AvatarUrl);

    private record CommentDetailDto(
        Guid Id, Guid SuggestionId, string Body,
        CommentAuthorSummary Author, DateTime CreatedAt, DateTime? EditedAt, bool Deleted);

    private record SuggestionDetail(
        Guid Id, Guid RestaurantId, string Name, string? Cuisine,
        int VoteCount, bool IsWinner);

    private record SessionDetail(
        Guid Id, string TeamId, string State,
        DateTime StartedAt, DateTime? DecidedAt, string? Winner,
        IReadOnlyList<SuggestionDetail> Suggestions,
        IReadOnlyList<CommentDetailDto> Comments);

    public static IEndpointRouteBuilder MapHistoryEndpoints(this IEndpointRouteBuilder app)
    {
        var teamGroup = app.MapGroup("/teams/{teamId:guid}")
            .WithTags("History")
            .RequireAuthorization();

        teamGroup.MapGet("/history", GetHistory).RequireTeamMembership();

        var sessionGroup = app.MapGroup("/sessions")
            .WithTags("History")
            .RequireAuthorization();

        sessionGroup.MapGet("/{sessionId:guid}/detail", GetDetail);

        return app;
    }

    private static async Task<IResult> GetHistory(
        Guid teamId,
        int page,
        int pageSize,
        AppDbContext db)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = db.LunchSessions
            .AsNoTracking()
            .Include(s => s.Suggestions).ThenInclude(sg => sg.Restaurant)
            .Include(s => s.Votes)
            .Where(s => s.TeamId == teamId &&
                   (s.State == SessionState.Decided || s.State == SessionState.Cancelled))
            .OrderByDescending(s => s.StartedAt);

        var total = await query.CountAsync();
        var sessions = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = sessions.Select(s =>
        {
            var winner = s.WinnerSuggestionId is not null
                ? s.Suggestions.FirstOrDefault(sg => sg.Id == s.WinnerSuggestionId)?.Restaurant?.Name
                : null;

            var tally = s.Suggestions
                .Where(sg => sg.WithdrawnAt == null)
                .Select(sg => new TallyEntry(
                    sg.Restaurant.Id,
                    sg.Restaurant.Name,
                    s.Votes.Count(v => v.SuggestionId == sg.Id)))
                .OrderByDescending(t => t.Votes)
                .ToList();

            var participantCount = s.Votes.Select(v => v.UserId)
                .Union(s.Suggestions.Select(sg => sg.SuggestedBy))
                .Distinct()
                .Count();

            return new HistoryItem(s.Id, s.StartedAt, winner, tally, participantCount);
        }).ToList();

        return Results.Ok(new PagedHistory(items, total, page, pageSize));
    }

    private static async Task<IResult> GetDetail(
        Guid sessionId,
        HttpContext ctx,
        AppDbContext db)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var session = await db.LunchSessions
            .AsNoTracking()
            .Include(s => s.Suggestions).ThenInclude(sg => sg.Restaurant)
            .Include(s => s.Votes)
            .Include(s => s.Comments)
            .Where(s => s.Id == sessionId &&
                   (s.State == SessionState.Decided || s.State == SessionState.Cancelled))
            .FirstOrDefaultAsync();

        if (session is null) return Results.NotFound();

        // Verify user is a team member
        var isMember = await db.Memberships
            .AsNoTracking()
            .AnyAsync(m => m.TeamId == session.TeamId && m.UserId == userId);
        if (!isMember) return Results.Forbid();

        var winner = session.WinnerSuggestionId is not null
            ? session.Suggestions.FirstOrDefault(sg => sg.Id == session.WinnerSuggestionId)?.Restaurant?.Name
            : null;

        var suggestions = session.Suggestions
            .Where(sg => sg.WithdrawnAt == null)
            .Select(sg => new SuggestionDetail(
                sg.Id,
                sg.Restaurant.Id,
                sg.Restaurant.Name,
                sg.Restaurant.Cuisine,
                session.Votes.Count(v => v.SuggestionId == sg.Id),
                sg.Id == session.WinnerSuggestionId))
            .OrderByDescending(s => s.VoteCount)
            .ToList();

        // Load comment authors
        var authorIds = session.Comments.Select(c => c.UserId).Distinct().ToList();
        var authors = await db.Users
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(u => authorIds.Contains(u.Id))
            .Select(u => new { u.Id, u.DisplayName, u.AvatarUrl, u.DeletedAt })
            .ToDictionaryAsync(u => u.Id);

        var comments = session.Comments
            .OrderBy(c => c.CreatedAt)
            .Select(c =>
            {
                authors.TryGetValue(c.UserId, out var author);
                var authorSummary = author is null || author.DeletedAt is not null
                    ? new CommentAuthorSummary(Guid.Empty, "[deleted user]", null)
                    : new CommentAuthorSummary(author.Id, author.DisplayName, author.AvatarUrl);
                return new CommentDetailDto(
                    c.Id, c.SuggestionId,
                    c.DeletedAt is not null ? "" : c.Body,
                    authorSummary, c.CreatedAt, c.EditedAt,
                    c.DeletedAt is not null);
            })
            .ToList();

        return Results.Ok(new SessionDetail(
            session.Id, session.TeamId.ToString(), session.State.ToString(),
            session.StartedAt, session.DecidedAt, winner,
            suggestions, comments));
    }
}
