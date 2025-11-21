using beerbuddy.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace beerbuddy.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BeerInventoryController : ControllerBase
    {
        private readonly BrewBuddyContext _context;

        public BeerInventoryController(BrewBuddyContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var beers = await _context.BeerInventories.ToListAsync();
            return Ok(beers);
        }
    }
}
