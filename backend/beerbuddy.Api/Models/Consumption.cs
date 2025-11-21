using System;
using System.Collections.Generic;

namespace beerbuddy.Api.Models;

public partial class Consumption
{
    public uint Id { get; set; }

    public uint UserId { get; set; }

    public uint BeerId { get; set; }

    public int UnitsTaken { get; set; }

    public DateTime TimeTaken { get; set; }

    public virtual BeerInventory Beer { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
