using beerbuddy.Api.Dtos;
using beerbuddy.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace beerbuddy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly LeaderboardService _leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService)
    {
        _leaderboardService = leaderboardService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> Get(
        [FromQuery(Name = "from")] DateTimeOffset? from,
        [FromQuery(Name = "to")] DateTimeOffset? to,
        CancellationToken cancellationToken)
    {
        var leaderboard = await _leaderboardService.GetLeaderboardAsync(from, to, cancellationToken);
        return Ok(leaderboard);
    }
}
