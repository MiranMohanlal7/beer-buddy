using System;
using System.Collections.Generic;

namespace beerbuddy.Api.Models;

public partial class User
{
    public uint Id { get; set; }

    public string Username { get; set; } = null!;

    public int RfidTagId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Consumption> Consumptions { get; set; } = new List<Consumption>();
}
