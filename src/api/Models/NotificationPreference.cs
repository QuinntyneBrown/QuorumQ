namespace QuorumQ.Api.Models;

public class NotificationPreference
{
    public Guid UserId { get; set; }
    public Guid TeamId { get; set; }
    public bool Muted { get; set; }

    public User User { get; set; } = null!;
    public Team Team { get; set; } = null!;
}
