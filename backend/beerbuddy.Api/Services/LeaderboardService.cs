using beerbuddy.Api.Data;
using beerbuddy.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace beerbuddy.Api.Services;

public class LeaderboardService
{
    private readonly BrewBuddyContext _context;

    public LeaderboardService(BrewBuddyContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<LeaderboardEntryDto>> GetLeaderboardAsync(
        DateTimeOffset? from,
        DateTimeOffset? to,
        CancellationToken cancellationToken = default)
    {
        var (normalizedFrom, normalizedTo) = NormalizeRange(from, to);
        var fromUtc = normalizedFrom.UtcDateTime;
        var toUtc = normalizedTo.UtcDateTime;

        var users = await _context.Users.AsNoTracking()
            .Select(u => new { u.Id, u.Username })
            .ToListAsync(cancellationToken);

        var beerNames = await _context.BeerInventory.AsNoTracking()
            .Select(b => new { b.Id, b.Name })
            .ToDictionaryAsync(b => b.Id, b => b.Name, cancellationToken);

        var consumptionByUserAndDrink = await _context.Consumption.AsNoTracking()
            .Where(c => c.TimeTaken >= fromUtc && c.TimeTaken < toUtc)
            .GroupBy(c => new { c.UserId, c.BeerId })
            .Select(group => new
            {
                group.Key.UserId,
                group.Key.BeerId,
                Units = group.Sum(x => x.UnitsTaken)
            })
            .ToListAsync(cancellationToken);

        var entries = users
            .Select(user =>
            {
                var userConsumption = consumptionByUserAndDrink
                    .Where(c => c.UserId == user.Id)
                    .ToList();

                var breakdown = userConsumption
                    .Select(record => new DrinkBreakdownDto
                    {
                        DrinkId = record.BeerId,
                        DrinkName = beerNames.TryGetValue(record.BeerId, out var name)
                            ? name
                            : $"Drink {record.BeerId}",
                        UnitsTaken = record.Units
                    })
                    .OrderByDescending(d => d.UnitsTaken)
                    .ThenBy(d => d.DrinkName)
                    .ToList();

                var totalUnits = userConsumption.Sum(c => c.Units);

                return new LeaderboardEntryDto
                {
                    UserId = user.Id,
                    Username = user.Username,
                    TotalUnits = totalUnits,
                    Drinks = breakdown
                };
            })
            .OrderByDescending(entry => entry.TotalUnits)
            .ThenBy(entry => entry.Username)
            .ToList();

        for (var i = 0; i < entries.Count; i++)
        {
            entries[i].Rank = i + 1;
        }

        return entries;
    }

    private static (DateTimeOffset from, DateTimeOffset to) NormalizeRange(
        DateTimeOffset? from,
        DateTimeOffset? to)
    {
        var now = DateTimeOffset.Now;
        var defaultFrom = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, now.Offset);
        var rangeStart = from ?? defaultFrom;
        var rangeEnd = to ?? new DateTimeOffset(rangeStart.Year, rangeStart.Month, 1, 0, 0, 0, rangeStart.Offset).AddMonths(1);

        if (rangeEnd <= rangeStart)
        {
            rangeEnd = rangeStart.AddMonths(1);
        }

        return (rangeStart, rangeEnd);
    }
}
