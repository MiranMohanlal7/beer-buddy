namespace beerbuddy.Api.Dtos;

public class DrinkBreakdownDto
{
    public int DrinkId { get; init; }
    public required string DrinkName { get; init; }
    public int UnitsTaken { get; init; }
}

public class LeaderboardEntryDto
{
    public int Rank { get; set; }
    public int UserId { get; init; }
    public required string Username { get; init; }
    public int TotalUnits { get; init; }
    public IReadOnlyCollection<DrinkBreakdownDto> Drinks { get; init; } = Array.Empty<DrinkBreakdownDto>();
}
