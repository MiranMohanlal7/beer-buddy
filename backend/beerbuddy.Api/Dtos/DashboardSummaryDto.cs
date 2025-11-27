namespace beerbuddy.Api.Dtos;

public class DashboardSummaryDto
{
    public required string CurrentUserName { get; init; }
    public double OverallStockPercentage { get; init; }
    public required string HeroSummary { get; init; }
    public required string NotificationCopy { get; init; }
    public required IReadOnlyCollection<AlertDto> Alerts { get; init; }
    public required IReadOnlyCollection<CompartmentStatusDto> Compartments { get; init; }
    public required string NextTopUpCompartment { get; init; }
}
