using beerbuddy.Api.Data;
using beerbuddy.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace beerbuddy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConsumptionController : ControllerBase
{
    private readonly BrewBuddyContext _context;

    public ConsumptionController(BrewBuddyContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ConsumptionEventDto>>> Get(
        [FromQuery(Name = "from")] DateTimeOffset? from,
        [FromQuery(Name = "to")] DateTimeOffset? to,
        CancellationToken cancellationToken)
    {
        var (rangeStart, rangeEnd) = NormalizeRange(from, to);
        var startUtc = rangeStart.UtcDateTime;
        var endUtc = rangeEnd.UtcDateTime;

        var events = await _context.Consumption.AsNoTracking()
            .Include(c => c.User)
            .Include(c => c.Beer)
            .Where(c => c.TimeTaken >= startUtc && c.TimeTaken < endUtc)
            .OrderByDescending(c => c.TimeTaken)
            .Select(c => new ConsumptionEventDto
            {
                Id = c.Id,
                UserId = c.UserId,
                Username = c.User != null ? c.User.Username : $"User {c.UserId}",
                BeerId = c.BeerId,
                BeerName = c.Beer != null ? c.Beer.Name : $"Drink {c.BeerId}",
                UnitsTaken = c.UnitsTaken,
                TimeTaken = c.TimeTaken
            })
            .ToListAsync(cancellationToken);

        return Ok(events);
    }

    private static (DateTimeOffset from, DateTimeOffset to) NormalizeRange(
        DateTimeOffset? from,
        DateTimeOffset? to)
    {
        var now = DateTimeOffset.Now;
        var defaultFrom = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, now.Offset);
        var rangeStart = from ?? defaultFrom;
        var rangeEnd = to ?? new DateTimeOffset(
            rangeStart.Year,
            rangeStart.Month,
            1,
            0,
            0,
            0,
            rangeStart.Offset).AddMonths(1);

        if (rangeEnd <= rangeStart)
        {
            rangeEnd = rangeStart.AddMonths(1);
        }

        return (rangeStart, rangeEnd);
    }
}
