using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace beerbuddy.ApiModels 
{
    // ---------------------------------------------------------
    // TABLE 1: beer_inventory
    // ---------------------------------------------------------
    [Table("beer_inventory")] 
    public class BeerInventory
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("price")]
        public decimal Price { get; set; }

        [Column("unit_weight")]
        public double UnitWeight { get; set; } // Weight of one full beer

        [Column("unit_empty")]
        public double UnitEmpty { get; set; } // Weight of empty bottle/can

        [Column("current_weight")]
        public double CurrentWeight { get; set; } // Current scale reading
    }

    // ---------------------------------------------------------
    // TABLE 2: consumption
    // ---------------------------------------------------------
    [Table("consumption")]
    public class Consumption
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; } // Foreign Key to Users table

        [Column("beer_id")]
        public int BeerId { get; set; } // Foreign Key to BeerInventory table

        [Column("units_taken")]
        public int UnitsTaken { get; set; }

        [Column("time_taken")]
        public DateTime TimeTaken { get; set; }
    }

    // ---------------------------------------------------------
    // INPUT: Data sent from the ESP32
    // ---------------------------------------------------------
    public class EspUpdateInput
    {
        public int BeerId { get; set; }       // The ID of the beer on this specific scale
        public int UserId { get; set; }       // The ID of the user (send 1 if unknown)
        public double NewCurrentWeight { get; set; } // The raw weight from the scale
    }
}
