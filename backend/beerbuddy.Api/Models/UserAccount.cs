namespace beerbuddy.Api.Models;

public class UserAccount
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public int RfidTagId { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<ConsumptionRecord> ConsumptionRecords { get; set; } = new List<ConsumptionRecord>();
}
