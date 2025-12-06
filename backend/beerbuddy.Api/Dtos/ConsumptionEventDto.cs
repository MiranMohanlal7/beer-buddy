namespace beerbuddy.Api.Dtos;

public class ConsumptionEventDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int BeerId { get; set; }
    public string BeerName { get; set; } = string.Empty;
    public int UnitsTaken { get; set; }
    public DateTime TimeTaken { get; set; }
}
