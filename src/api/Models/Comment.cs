namespace QuorumQ.Api.Models;

public class Comment
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public Guid SuggestionId { get; set; }
    public Guid UserId { get; set; }
    public string Body { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? EditedAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    public LunchSession Session { get; set; } = null!;
    public Suggestion Suggestion { get; set; } = null!;
    public User User { get; set; } = null!;
}
