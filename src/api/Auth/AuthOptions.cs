namespace QuorumQ.Api.Auth;

public class AuthOptions
{
    public const string SectionName = "Auth";
    public int SessionLifetimeDays { get; set; } = 30;
    public int RateLimitAttempts { get; set; } = 5;
    public int RateLimitWindowMinutes { get; set; } = 10;
}
