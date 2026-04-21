using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;
using QuorumQ.Api.Hubs;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Endpoints;

public static class CommentEndpoints
{
    private record CreateCommentRequest(string Body);
    private record EditCommentRequest(string Body);
    private record AuthorSummary(Guid Id, string DisplayName, string? AvatarUrl);
    private record CommentDto(
        Guid Id, Guid SuggestionId, string Body,
        AuthorSummary Author, DateTime CreatedAt,
        DateTime? EditedAt, bool Deleted);

    public static IEndpointRouteBuilder MapCommentEndpoints(this IEndpointRouteBuilder app)
    {
        var sessionGroup = app.MapGroup("/sessions")
            .WithTags("Comments")
            .RequireAuthorization();

        sessionGroup.MapPost("/{sessionId:guid}/suggestions/{suggestionId:guid}/comments", AddComment);
        sessionGroup.MapGet("/{sessionId:guid}/comments", ListComments);

        var commentGroup = app.MapGroup("/comments")
            .WithTags("Comments")
            .RequireAuthorization();

        commentGroup.MapPut("/{commentId:guid}", EditComment);
        commentGroup.MapDelete("/{commentId:guid}", DeleteComment);

        return app;
    }

    private static async Task<IResult> AddComment(
        Guid sessionId,
        Guid suggestionId,
        CreateCommentRequest req,
        HttpContext ctx,
        AppDbContext db,
        IHubContext<SessionHub, ISessionHubClient> hub)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        if (string.IsNullOrWhiteSpace(req.Body) || req.Body.Length > 500)
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["body"] = ["Comment must be between 1 and 500 characters."]
            });

        var session = await db.LunchSessions.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session is null) return Results.NotFound();

        if (session.State is SessionState.Decided or SessionState.Cancelled)
            return Results.Problem("Session is not in an active state.", statusCode: 409);

        var suggestion = await db.Suggestions.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == suggestionId && s.SessionId == sessionId);
        if (suggestion is null) return Results.NotFound();

        var user = await db.Users.AsNoTracking()
            .Select(u => new { u.Id, u.DisplayName, u.AvatarUrl })
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return Results.Unauthorized();

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            SuggestionId = suggestionId,
            UserId = userId,
            Body = req.Body,
            CreatedAt = DateTime.UtcNow,
        };

        db.Comments.Add(comment);
        await db.SaveChangesAsync();

        var dto = new CommentDto(
            comment.Id, comment.SuggestionId, comment.Body,
            new AuthorSummary(user.Id, user.DisplayName, user.AvatarUrl),
            comment.CreatedAt, null, false);

        await hub.Clients.Group(SessionHub.GroupName(sessionId))
            .CommentAdded(dto);

        return Results.Created($"/comments/{comment.Id}", dto);
    }

    private static async Task<IResult> ListComments(
        Guid sessionId,
        AppDbContext db)
    {
        var comments = await db.Comments
            .AsNoTracking()
            .Where(c => c.SessionId == sessionId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentDto(
                c.Id, c.SuggestionId,
                c.DeletedAt != null ? "" : c.Body,
                new AuthorSummary(c.User.Id, c.User.DisplayName, c.User.AvatarUrl),
                c.CreatedAt, c.EditedAt, c.DeletedAt != null))
            .ToListAsync();

        return Results.Ok(comments);
    }

    private static async Task<IResult> EditComment(
        Guid commentId,
        EditCommentRequest req,
        HttpContext ctx,
        AppDbContext db,
        IHubContext<SessionHub, ISessionHubClient> hub)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        if (string.IsNullOrWhiteSpace(req.Body) || req.Body.Length > 500)
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["body"] = ["Comment must be between 1 and 500 characters."]
            });

        var comment = await db.Comments.FirstOrDefaultAsync(c => c.Id == commentId);
        if (comment is null) return Results.NotFound();
        if (comment.UserId != userId) return Results.Forbid();
        if (comment.DeletedAt is not null)
            return Results.Problem("Comment has been deleted.", statusCode: 409);

        if (DateTime.UtcNow - comment.CreatedAt > TimeSpan.FromMinutes(5))
            return Results.Problem("Edit window has expired.", statusCode: 409);

        comment.Body = req.Body;
        comment.EditedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var user = await db.Users.AsNoTracking()
            .Select(u => new { u.Id, u.DisplayName, u.AvatarUrl })
            .FirstOrDefaultAsync(u => u.Id == userId);

        var dto = new CommentDto(
            comment.Id, comment.SuggestionId, comment.Body,
            new AuthorSummary(userId, user?.DisplayName ?? "", user?.AvatarUrl),
            comment.CreatedAt, comment.EditedAt, false);

        await hub.Clients.Group(SessionHub.GroupName(comment.SessionId))
            .CommentEdited(dto);

        return Results.Ok(dto);
    }

    private static async Task<IResult> DeleteComment(
        Guid commentId,
        HttpContext ctx,
        AppDbContext db,
        IHubContext<SessionHub, ISessionHubClient> hub)
    {
        var userIdStr = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Results.Unauthorized();

        var comment = await db.Comments.FirstOrDefaultAsync(c => c.Id == commentId);
        if (comment is null) return Results.NotFound();
        if (comment.UserId != userId) return Results.Forbid();

        comment.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        await hub.Clients.Group(SessionHub.GroupName(comment.SessionId))
            .CommentDeleted(new { commentId, suggestionId = comment.SuggestionId });

        return Results.NoContent();
    }
}
