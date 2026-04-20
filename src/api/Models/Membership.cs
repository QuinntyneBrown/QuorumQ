namespace QuorumQ.Api.Models;

public enum MembershipRole { Member, Admin, Owner }

public class Membership
{
    public Guid UserId { get; set; }
    public Guid TeamId { get; set; }
    public MembershipRole Role { get; set; }
    public DateTime JoinedAt { get; set; }

    public User User { get; set; } = null!;
    public Team Team { get; set; } = null!;
}
