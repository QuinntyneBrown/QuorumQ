using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;
using QuorumQ.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=quorumq.db"));

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddOpenApi();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}

var app = builder.Build();

// Apply migrations and seed on startup in Development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    SeedData.Initialize(db);
}

app.UseExceptionHandler();
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

app.MapHub<QuorumQ.Api.Hubs.SessionHub>("/hubs/session");

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
   .WithTags("Health")
   .ExcludeFromDescription();

app.MapAuthEndpoints();
app.MapTeamEndpoints();
app.MapSessionEndpoints();
app.MapSuggestionEndpoints();
app.MapVoteEndpoints();
app.MapCommentEndpoints();
app.MapReviewEndpoints();
app.MapHistoryEndpoints();

app.Run();
