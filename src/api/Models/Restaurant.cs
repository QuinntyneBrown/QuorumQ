namespace QuorumQ.Api.Models;

public class Restaurant
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public string Name { get; set; } = "";
    public string? Cuisine { get; set; }
    public string? Address { get; set; }
    public string? WebsiteUrl { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }

    public Team Team { get; set; } = null!;
    public ICollection<Suggestion> Suggestions { get; set; } = [];
}
