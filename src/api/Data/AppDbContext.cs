using Microsoft.EntityFrameworkCore;

namespace QuorumQ.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
}
