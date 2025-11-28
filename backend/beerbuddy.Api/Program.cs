using beerbuddy.Api.Data;
using beerbuddy.Api.Options;
using beerbuddy.Api.Services;
using Microsoft.EntityFrameworkCore;
using MySql.EntityFrameworkCore.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Controllers (voor bv. DrinksController)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Force camelCase so frontend gets "description" and other fields consistently.
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddDbContext<BrewBuddyContext>(options =>
{
    var connectionString =
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? builder.Configuration.GetConnectionString("BrewBuddy")
        ?? throw new InvalidOperationException("Database connection string not configured.");

    options.UseMySQL(connectionString);
});

builder.Services.Configure<DashboardOptions>(builder.Configuration.GetSection("Dashboard"));
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<LeaderboardService>();

// OpenAPI/Swagger (handig om je endpoints te testen)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// CORS zodat je React frontend (http://localhost:5173) mag praten met de API
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()   // voor nu: alles toestaan (dev only)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Alleen in Development de OpenAPI UI beschikbaar maken
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // .NET 8 stijl i.p.v. oude Swagger extensie
}

app.UseHttpsRedirection();

app.UseCors();

// Koppel alle controllers (zoals /api/drinks)
app.MapControllers();

app.Run();
