using Microsoft.EntityFrameworkCore;
using QuorumQ.Api.Data;

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
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors();

if (app.Environment.IsDevelopment())
{
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
