namespace QuorumQ.Api.Models;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string? AvatarUrl { get; set; }
    public DateTime? EmailVerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string ThemePreference { get; set; } = "system";

    public ICollection<Membership> Memberships { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
}
