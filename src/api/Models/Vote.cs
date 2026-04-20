namespace QuorumQ.Api.Models;

public class Vote
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public Guid SuggestionId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CastAt { get; set; }

    public LunchSession Session { get; set; } = null!;
    public Suggestion Suggestion { get; set; } = null!;
    public User User { get; set; } = null!;
}
