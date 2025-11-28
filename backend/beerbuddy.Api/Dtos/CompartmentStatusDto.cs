using System.Text.Json.Serialization;

namespace beerbuddy.Api.Dtos;

public class CompartmentStatusDto
{
    public int Id { get; init; }
    public required string Title { get; init; }
    public required string Status { get; init; }
    [JsonPropertyName("description")]
    public required string Description { get; init; }
    public double Percentage { get; init; }
    public double CurrentUnits { get; init; }
    public double TargetUnits { get; init; }
    public decimal PricePerUnit { get; init; }
}
