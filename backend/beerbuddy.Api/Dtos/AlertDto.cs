namespace beerbuddy.Api.Dtos;

public class AlertDto
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required string Severity { get; init; }
}
