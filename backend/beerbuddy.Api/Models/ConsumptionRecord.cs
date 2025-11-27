namespace beerbuddy.Api.Models;

public class ConsumptionRecord
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int BeerId { get; set; }
    public int UnitsTaken { get; set; }
    public DateTime TimeTaken { get; set; }

    public UserAccount? User { get; set; }
    public BeerInventory? Beer { get; set; }
}
