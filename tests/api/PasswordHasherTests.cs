using QuorumQ.Api.Auth;

namespace QuorumQ.Api.Tests;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact(DisplayName = "[L2-42] stored password hashes are non-reversible: hash does not contain plaintext")]
    public void Hash_DoesNotContainPlaintext()
    {
        var hash = _hasher.Hash("SuperSecret99!");
        Assert.DoesNotContain("SuperSecret99!", hash);
    }

    [Fact(DisplayName = "[L2-42] stored password hashes are non-reversible: hash format is pbkdf2")]
    public void Hash_HasPbkdf2Format()
    {
        var hash = _hasher.Hash("AnyPassword1");
        Assert.StartsWith("pbkdf2$", hash);
        Assert.Equal(3, hash.Split('$').Length);
    }

    [Fact(DisplayName = "[L2-42] stored password hashes are non-reversible: two hashes of same password differ (per-user salt)")]
    public void Hash_PerUserSalt_ProducesDifferentHashes()
    {
        var h1 = _hasher.Hash("SamePassword1!");
        var h2 = _hasher.Hash("SamePassword1!");
        Assert.NotEqual(h1, h2);
    }

    [Fact(DisplayName = "[L2-42] verify returns true for correct password")]
    public void Verify_Correct_ReturnsTrue()
    {
        var hash = _hasher.Hash("ValidPass1!");
        Assert.True(_hasher.Verify("ValidPass1!", hash));
    }

    [Fact(DisplayName = "[L2-42] verify returns false for wrong password")]
    public void Verify_Wrong_ReturnsFalse()
    {
        var hash = _hasher.Hash("ValidPass1!");
        Assert.False(_hasher.Verify("WrongPass1!", hash));
    }

    [Fact(DisplayName = "[L2-42] verify returns false for off-by-one password")]
    public void Verify_OffByOne_ReturnsFalse()
    {
        var hash = _hasher.Hash("ValidPass1!");
        Assert.False(_hasher.Verify("ValidPass1", hash));
    }
}
