using beerbuddy.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace beerbuddy.Api.Data;

public class BrewBuddyContext(DbContextOptions<BrewBuddyContext> options) : DbContext(options)
{
    public DbSet<BeerInventory> BeerInventory => Set<BeerInventory>();
    public DbSet<ConsumptionRecord> Consumption => Set<ConsumptionRecord>();
    public DbSet<SharedNote> SharedNotes => Set<SharedNote>();
    public DbSet<UserAccount> Users => Set<UserAccount>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BeerInventory>(entity =>
        {
            entity.ToTable("beer_inventory");
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Id).HasColumnName("id");
            entity.Property(b => b.Name).HasColumnName("name").IsRequired();
            entity.Property(b => b.Description).HasColumnName("description").IsRequired();
            entity.Property(b => b.Price).HasColumnName("price").HasColumnType("decimal(6,2)");
            entity.Property(b => b.UnitWeight).HasColumnName("unit_weight");
            entity.Property(b => b.UnitEmpty).HasColumnName("unit_empty");
            entity.Property(b => b.CurrentWeight).HasColumnName("current_weight");
            entity.Property(b => b.MaxWeight).HasColumnName("max_weight");

            entity.HasData(
                new BeerInventory
                {
                    Id = 1,
                    Name = "Fritz Kola 33cl fles",
                    Description =
                        "Een 33cl fles Fritz-Kola levert een krachtige, puur kolasmaak met opvallend hoge cafeïne en een lichte frisse citrustoon. Minder zoet dan gewone cola en gemaakt met echte suiker, waardoor de smaak voller en intenser is. Een energieke, karaktervolle dorstlesser voor iedereen die net wat meer pit zoekt.",
                    Price = 1.50m,
                    UnitWeight = 380,
                    UnitEmpty = 800,
                    CurrentWeight = 1900,
                    MaxWeight = 1900
                },
                new BeerInventory
                {
                    Id = 2,
                    Name = "Monster Energy 50cl",
                    Description =
                        "Een 50cl blik Monster Energy geeft een krachtige boost met zijn herkenbare mix van zoete, frisse citrus- en guaranatonen. De volle, intense smaak en hoge cafeïne zorgen voor directe energie, perfect voor lange dagen of late avonden. Een blik dat pure power en uithoudingsvermogen levert bij elke slok.",
                    Price = 2.39m,
                    UnitWeight = 520,
                    UnitEmpty = 1580,
                    CurrentWeight = 2080,
                    MaxWeight = 2080
                },
                new BeerInventory
                {
                    Id = 3,
                    Name = "Redbull blik 25cl",
                    Description =
                        "Een 25cl blik Red Bull biedt een scherpe, herkenbare energieboost met zijn lichtzoete, fris-zure smaak en sprankelende kick. Compact en krachtig: precies genoeg om je concentratie en alertheid te verhogen wanneer je het nodig hebt. Een kleine blik vol directe, betrouwbare energie.",
                    Price = 1.79m,
                    UnitWeight = 260,
                    UnitEmpty = 540,
                    CurrentWeight = 780,
                    MaxWeight = 780
                });
        });

        modelBuilder.Entity<UserAccount>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Id).HasColumnName("id");
            entity.Property(u => u.Username).HasColumnName("username").IsRequired();
            entity.Property(u => u.RfidTagId).HasColumnName("rfid_tag_id");
            entity.Property(u => u.CreatedAt).HasColumnName("created_at");

            entity.HasData(
                new UserAccount
                {
                    Id = 1,
                    Username = "Sam",
                    RfidTagId = 1,
                    CreatedAt = DateTime.SpecifyKind(DateTime.Parse("2025-11-21T10:58:14"), DateTimeKind.Utc)
                },
                new UserAccount
                {
                    Id = 2,
                    Username = "Jim",
                    RfidTagId = 2,
                    CreatedAt = DateTime.SpecifyKind(DateTime.Parse("2025-11-21T10:58:24"), DateTimeKind.Utc)
                },
                new UserAccount
                {
                    Id = 3,
                    Username = "Jules",
                    RfidTagId = 3,
                    CreatedAt = DateTime.SpecifyKind(DateTime.Parse("2025-11-21T10:58:30"), DateTimeKind.Utc)
                },
                new UserAccount
                {
                    Id = 4,
                    Username = "Miran",
                    RfidTagId = 4,
                    CreatedAt = DateTime.SpecifyKind(DateTime.Parse("2025-11-21T10:58:37"), DateTimeKind.Utc)
                });
        });

        modelBuilder.Entity<ConsumptionRecord>(entity =>
        {
            entity.ToTable("consumption");
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Id).HasColumnName("id");
            entity.Property(c => c.UserId).HasColumnName("user_id");
            entity.Property(c => c.BeerId).HasColumnName("beer_id");
            entity.Property(c => c.UnitsTaken).HasColumnName("units_taken");
            entity.Property(c => c.TimeTaken).HasColumnName("time_taken");

            entity.HasOne(c => c.User)
                .WithMany(u => u.ConsumptionRecords)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.Beer)
                .WithMany()
                .HasForeignKey(c => c.BeerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasData(
                new ConsumptionRecord
                {
                    Id = 1,
                    UserId = 1,
                    BeerId = 3,
                    UnitsTaken = 2,
                    TimeTaken = DateTime.SpecifyKind(DateTime.Parse("2025-11-27T09:22:14"), DateTimeKind.Utc)
                },
                new ConsumptionRecord
                {
                    Id = 2,
                    UserId = 3,
                    BeerId = 1,
                    UnitsTaken = 6,
                    TimeTaken = DateTime.SpecifyKind(DateTime.Parse("2025-11-27T09:22:40"), DateTimeKind.Utc)
                });
        });

        modelBuilder.Entity<SharedNote>(entity =>
        {
            entity.ToTable("shared_notes");
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Id).HasColumnName("id");
            entity.Property(n => n.Name).HasColumnName("name").IsRequired();
            entity.Property(n => n.Message).HasColumnName("message").IsRequired();
            entity.Property(n => n.CreatedAt).HasColumnName("created_at");

            entity.HasData(
                new SharedNote
                {
                    Id = 1,
                    Name = "Sam",
                    Message = "Dit is een test bericht",
                    CreatedAt = DateTime.SpecifyKind(DateTime.Parse("2025-11-27T09:21:35"), DateTimeKind.Utc)
                },
                new SharedNote
                {
                    Id = 2,
                    Name = "Jules",
                    Message = "Dit is een test om te kijken of dit displayed op de frontend",
                    CreatedAt = DateTime.SpecifyKind(DateTime.Parse("2025-11-27T09:23:04"), DateTimeKind.Utc)
                });
        });
    }
}
