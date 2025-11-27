using Microsoft.EntityFrameworkCore;
using beerbuddy.ApiModels; 

namespace beerbuddy.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // These properties link the C# classes to the MySQL tables
        public DbSet<BeerInventory> BeerInventories { get; set; }
        public DbSet<Consumption> Consumptions { get; set; }
    }
}
