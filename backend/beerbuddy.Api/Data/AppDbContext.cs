using Microsoft.EntityFrameworkCore;
using beerbuddy.Api.Models;

namespace beerbuddy.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Note> Notes { get; set; }
    }
}
