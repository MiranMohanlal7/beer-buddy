using System;
using System.Collections.Generic;

namespace beerbuddy.Api.Models;

public partial class BeerInventory
{
    public uint Id { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = null!;

    public decimal Price { get; set; }

    public int UnitWeight { get; set; }

    public int UnitEmpty { get; set; }

    public int TotalWeight { get; set; }

    public virtual ICollection<Consumption> Consumptions { get; set; } = new List<Consumption>();
}
