namespace QuorumQ.Api.Models;

public class Review
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; }
    public string? Body { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public LunchSession Session { get; set; } = null!;
    public Restaurant Restaurant { get; set; } = null!;
    public User User { get; set; } = null!;
}
