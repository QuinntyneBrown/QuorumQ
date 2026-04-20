namespace QuorumQ.Api.Models;

public class Suggestion
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid SuggestedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? WithdrawnAt { get; set; }

    public LunchSession Session { get; set; } = null!;
    public Restaurant Restaurant { get; set; } = null!;
    public ICollection<Vote> Votes { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
}
