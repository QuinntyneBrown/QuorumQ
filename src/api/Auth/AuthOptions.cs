namespace QuorumQ.Api.Auth;

public class AuthOptions
{
    public const string Section = "Auth";
    public int SessionLifetimeDays { get; set; } = 7;
    public int RateLimitMaxAttempts { get; set; } = 5;
    public int RateLimitWindowMinutes { get; set; } = 10;
    public string PublicBaseUrl { get; set; } = "http://localhost:4200";
}
