using beerbuddy.Api.Data;
using beerbuddy.Api.Dtos;
using beerbuddy.Api.Models;
using beerbuddy.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace beerbuddy.Api.Services;

public class DashboardService
{
    private readonly BrewBuddyContext _context;
    private readonly DashboardOptions _options;

    public DashboardService(BrewBuddyContext context, IOptions<DashboardOptions> options)
    {
        _context = context;
        _options = options.Value;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var preferredUser = await ResolveCurrentUserAsync(cancellationToken);
        var inventory = await _context.BeerInventory.AsNoTracking().ToListAsync(cancellationToken);
        var consumption = await _context.Consumption.AsNoTracking().ToListAsync(cancellationToken);

        var compartments = BuildCompartmentStatuses(inventory, consumption);
        var alerts = BuildAlerts(compartments);

        var overallStock = CalculateOverallStock(compartments);
        var heroSummary = alerts.Count > 0
            ? "Heads up: a few compartments are trending low."
            : "All clear. Sensors report a comfortable stock level.";
        var notificationCopy = alerts.Count > 0
            ? $"{alerts.Count} compartment{(alerts.Count == 1 ? "" : "s")} below targets."
            : "No alerts at the moment. Enjoy the calm fridge vibes.";
        var lowestCompartment = compartments
            .OrderBy(c => c.Percentage)
            .FirstOrDefault();

        return new DashboardSummaryDto
        {
            CurrentUserName = preferredUser?.Username ?? "Fridge buddy",
            OverallStockPercentage = overallStock,
            HeroSummary = heroSummary,
            NotificationCopy = notificationCopy,
            Alerts = alerts,
            Compartments = compartments,
            NextTopUpCompartment = lowestCompartment?.Title ?? "Awaiting data"
        };
    }

    private async Task<UserAccount?> ResolveCurrentUserAsync(CancellationToken cancellationToken)
    {
        if (_options.DefaultUserId.HasValue)
        {
            var preferred = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == _options.DefaultUserId.Value, cancellationToken);
            if (preferred != null)
            {
                return preferred;
            }
        }

        return await _context.Users.AsNoTracking()
            .OrderBy(u => u.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static List<CompartmentStatusDto> BuildCompartmentStatuses(
        IReadOnlyCollection<BeerInventory> inventory,
        IReadOnlyCollection<ConsumptionRecord> consumption)
    {
        var statuses = new List<CompartmentStatusDto>(inventory.Count);
        foreach (var item in inventory)
        {
            var targetUnits = item.UnitWeight == 0
                ? 0
                : (double)item.MaxWeight / item.UnitWeight;

            var liveUnitsFromWeight = item.UnitWeight == 0
                ? 0
                : (double)item.CurrentWeight / item.UnitWeight;

            var currentUnits = Math.Max(0, liveUnitsFromWeight);
            var percentage = targetUnits <= 0
                ? 0
                : Math.Max(0, Math.Min(100, Math.Round(currentUnits / targetUnits * 100)));

            statuses.Add(new CompartmentStatusDto
            {
                Id = item.Id,
                Title = item.Name,
                Status = $"Max: {targetUnits:0} units",
                Description = item.Description,
                Percentage = percentage,
                CurrentUnits = Math.Round(currentUnits, 1),
                TargetUnits = Math.Round(targetUnits, 1),
                PricePerUnit = item.Price
            });
        }

        return statuses
            .OrderByDescending(c => c.Percentage)
            .ToList();
    }

    private static List<AlertDto> BuildAlerts(IEnumerable<CompartmentStatusDto> compartments)
    {
        var alerts = new List<AlertDto>();
        foreach (var compartment in compartments)
        {
            if (compartment.Percentage <= 15)
            {
                alerts.Add(new AlertDto
                {
                    Id = $"critical-{compartment.Id}",
                    Title = $"{compartment.Title} is almost empty",
                    Description = $"{compartment.CurrentUnits:0.#} of {compartment.TargetUnits:0.#} units remain. Plan a restock soon.",
                    Severity = "critical"
                });
            }
            else if (compartment.Percentage <= 35)
            {
                alerts.Add(new AlertDto
                {
                    Id = $"warning-{compartment.Id}",
                    Title = $"{compartment.Title} stock is trending low",
                    Description = $"Only {compartment.Percentage:0}% stocked. Add it to the next grocery run.",
                    Severity = "warning"
                });
            }
        }

        return alerts;
    }

    private static double CalculateOverallStock(IEnumerable<CompartmentStatusDto> compartments)
    {
        double totalCurrent = 0;
        double totalTarget = 0;

        foreach (var compartment in compartments)
        {
            totalCurrent += compartment.CurrentUnits;
            totalTarget += compartment.TargetUnits;
        }

        if (totalTarget <= 0)
        {
            return 0;
        }

        return Math.Max(0, Math.Min(100, Math.Round(totalCurrent / totalTarget * 100)));
    }
}
