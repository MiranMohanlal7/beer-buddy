using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace beerbuddy.Api.Models;

public partial class BrewBuddyContext : DbContext
{
    public BrewBuddyContext()
    {
    }

    public BrewBuddyContext(DbContextOptions<BrewBuddyContext> options)
        : base(options)
    {
    }

    public virtual DbSet<BeerInventory> BeerInventories { get; set; }

    public virtual DbSet<Consumption> Consumptions { get; set; }

    public virtual DbSet<User> Users { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<BeerInventory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity
                .ToTable("beer_inventory")
                .UseCollation("utf8mb4_general_ci");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description)
                .HasMaxLength(510)
                .HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Price)
                .HasPrecision(10)
                .HasColumnName("price");
            entity.Property(e => e.TotalWeight).HasColumnName("total_weight");
            entity.Property(e => e.UnitEmpty).HasColumnName("unit_empty");
            entity.Property(e => e.UnitWeight).HasColumnName("unit_weight");
        });

        modelBuilder.Entity<Consumption>(entity =>
        {
            entity.HasKey(e => new { e.Id, e.UserId, e.BeerId })
                .HasName("PRIMARY")
                .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0, 0 });

            entity
                .ToTable("consumption")
                .UseCollation("utf8mb4_general_ci");

            entity.HasIndex(e => e.BeerId, "fk_beer_id");

            entity.HasIndex(e => e.UserId, "fk_user_id");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.BeerId).HasColumnName("beer_id");
            entity.Property(e => e.TimeTaken)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("time_taken");
            entity.Property(e => e.UnitsTaken).HasColumnName("units_taken");

            entity.HasOne(d => d.Beer).WithMany(p => p.Consumptions)
                .HasForeignKey(d => d.BeerId)
                .HasConstraintName("fk_beer_id");

            entity.HasOne(d => d.User).WithMany(p => p.Consumptions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_user_id");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity
                .ToTable("users")
                .UseCollation("utf8mb4_general_ci");

            entity.HasIndex(e => e.Username, "username").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.RfidTagId).HasColumnName("rfid_tag_id");
            entity.Property(e => e.Username).HasColumnName("username");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
