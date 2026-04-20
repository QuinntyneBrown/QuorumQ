namespace QuorumQ.Api.Models;

public class Team
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }

    public User Owner { get; set; } = null!;
    public ICollection<Membership> Memberships { get; set; } = [];
    public ICollection<Restaurant> Restaurants { get; set; } = [];
    public ICollection<LunchSession> Sessions { get; set; } = [];
}
