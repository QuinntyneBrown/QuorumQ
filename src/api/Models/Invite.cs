namespace QuorumQ.Api.Models;

public class Invite
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public string Token { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public Guid CreatedBy { get; set; }

    public Team Team { get; set; } = null!;
}
