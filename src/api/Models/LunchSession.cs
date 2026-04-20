namespace QuorumQ.Api.Models;

public enum SessionState { Suggesting, Voting, Decided, Cancelled }

public class LunchSession
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public SessionState State { get; set; }
    public DateTime Deadline { get; set; }
    public DateTime? TieBreakDeadline { get; set; }
    public Guid StartedBy { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? DecidedAt { get; set; }
    public Guid? WinnerSuggestionId { get; set; }
    public bool WinnerChosenAtRandom { get; set; }

    public Team Team { get; set; } = null!;
    public ICollection<Suggestion> Suggestions { get; set; } = [];
    public ICollection<Vote> Votes { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
}
