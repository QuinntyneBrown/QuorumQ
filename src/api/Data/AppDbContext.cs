using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Models;

namespace QuorumQ.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Membership> Memberships => Set<Membership>();
    public DbSet<Invite> Invites => Set<Invite>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<LunchSession> LunchSessions => Set<LunchSession>();
    public DbSet<Suggestion> Suggestions => Set<Suggestion>();
    public DbSet<Vote> Votes => Set<Vote>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // ── User ─────────────────────────────────────────────────────────────
        b.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.DisplayName).HasMaxLength(100).IsRequired();
            e.HasQueryFilter(u => u.DeletedAt == null);
        });

        // ── Team ─────────────────────────────────────────────────────────────
        b.Entity<Team>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Name).HasMaxLength(50).IsRequired();
            e.HasOne(t => t.Owner).WithMany()
             .HasForeignKey(t => t.OwnerId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── Membership ───────────────────────────────────────────────────────
        b.Entity<Membership>(e =>
        {
            e.HasKey(m => new { m.UserId, m.TeamId });
            e.Property(m => m.Role).HasConversion<string>();
            e.HasOne(m => m.User).WithMany(u => u.Memberships).HasForeignKey(m => m.UserId);
            e.HasOne(m => m.Team).WithMany(t => t.Memberships).HasForeignKey(m => m.TeamId);
        });

        // ── Invite ───────────────────────────────────────────────────────────
        b.Entity<Invite>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Token).HasMaxLength(128).IsRequired();
            e.HasOne(i => i.Team).WithMany()
             .HasForeignKey(i => i.TeamId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Restaurant ───────────────────────────────────────────────────────
        b.Entity<Restaurant>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Name).HasMaxLength(200).IsRequired();
            e.HasOne(r => r.Team).WithMany(t => t.Restaurants)
             .HasForeignKey(r => r.TeamId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── LunchSession ─────────────────────────────────────────────────────
        b.Entity<LunchSession>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.State).HasConversion<string>();
            e.HasOne(s => s.Team).WithMany(t => t.Sessions)
             .HasForeignKey(s => s.TeamId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Suggestion ───────────────────────────────────────────────────────
        b.Entity<Suggestion>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.Session).WithMany(ls => ls.Suggestions)
             .HasForeignKey(s => s.SessionId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.Restaurant).WithMany(r => r.Suggestions)
             .HasForeignKey(s => s.RestaurantId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── Vote ─────────────────────────────────────────────────────────────
        b.Entity<Vote>(e =>
        {
            e.HasKey(v => v.Id);
            e.HasIndex(v => new { v.SessionId, v.UserId }).IsUnique();
            e.HasOne(v => v.Session).WithMany(s => s.Votes)
             .HasForeignKey(v => v.SessionId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(v => v.Suggestion).WithMany(s => s.Votes)
             .HasForeignKey(v => v.SuggestionId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(v => v.User).WithMany()
             .HasForeignKey(v => v.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── Comment ──────────────────────────────────────────────────────────
        b.Entity<Comment>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Body).HasMaxLength(500).IsRequired();
            e.HasOne(c => c.Session).WithMany(s => s.Comments)
             .HasForeignKey(c => c.SessionId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(c => c.Suggestion).WithMany(s => s.Comments)
             .HasForeignKey(c => c.SuggestionId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(c => c.User).WithMany()
             .HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── Review ───────────────────────────────────────────────────────────
        b.Entity<Review>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => new { r.SessionId, r.UserId }).IsUnique();
            e.HasOne(r => r.Session).WithMany()
             .HasForeignKey(r => r.SessionId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.Restaurant).WithMany()
             .HasForeignKey(r => r.RestaurantId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.User).WithMany()
             .HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── NotificationPreference ───────────────────────────────────────────
        b.Entity<NotificationPreference>(e =>
        {
            e.HasKey(np => new { np.UserId, np.TeamId });
            e.HasOne(np => np.User).WithMany()
             .HasForeignKey(np => np.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(np => np.Team).WithMany()
             .HasForeignKey(np => np.TeamId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Notification ─────────────────────────────────────────────────────
        b.Entity<Notification>(e =>
        {
            e.HasKey(n => n.Id);
            e.Property(n => n.Kind).HasMaxLength(64).IsRequired();
            e.HasOne(n => n.User).WithMany(u => u.Notifications)
             .HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
