using beerbuddy.Api.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Connection string uit appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// DbContext registreren (MySQL via Pomelo)
builder.Services.AddDbContext<BrewBuddyContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Controllers (API endpoints)
builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

// API routes
app.MapControllers();

app.Run();
