using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using beerbuddy.Api.Data;
using beerbuddy.ApiModels;

namespace beerbuddy.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // URL will be: api/fridge
    public class FridgeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FridgeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/fridge/update
        [HttpPost("update")]
        public async Task<IActionResult> UpdateInventory([FromBody] EspUpdateInput input)
        {
            // 1. Validate Input
            if (input == null) return BadRequest("No data received.");

            // 2. Get the specific beer from the database
            var beer = await _context.BeerInventories.FindAsync(input.BeerId);

            if (beer == null)
            {
                return NotFound($"Beer with ID {input.BeerId} not found in inventory.");
            }

            // 3. LOGIC START
            // Capture the current (old) weight before we overwrite it
            double oldCurrentWeight = beer.CurrentWeight;
            double newCurrentWeight = input.NewCurrentWeight;

            // Update the inventory with the new live weight immediately
            beer.CurrentWeight = newCurrentWeight;
            
            // Mark the entity as modified so Entity Framework knows to update it
            _context.Entry(beer).State = EntityState.Modified;

            // Calculate the difference
            // If Old (1000) - New (660) = 340. Positive result means weight was REMOVED.
            double weightDifference = oldCurrentWeight - newCurrentWeight;

            // 4. Check if a beer was taken
            // We use a threshold (e.g. 50g) to ignore sensor noise. 
            // Only if the weight dropped significantly do we register consumption.
            if (weightDifference > 50) 
            {
                // Calculate units. Example: 340g diff / 330g unit = 1.03 -> Rounds to 1.
                int unitsCalculated = (int)Math.Round(weightDifference / beer.UnitWeight);

                if (unitsCalculated > 0)
                {
                    // Create the consumption record
                    var consumptionRecord = new Consumption
                    {
                        UserId = input.UserId,
                        BeerId = input.BeerId,
                        UnitsTaken = unitsCalculated,
                        TimeTaken = DateTime.UtcNow // Always use UTC for backend times
                    };

                    _context.Consumptions.Add(consumptionRecord);
                }
            }

            // 5. Save all changes (Inventory update + Consumption log) to the database
            await _context.SaveChangesAsync();

            return Ok(new { message = "Data processed successfully", unitsTaken = weightDifference > 50 });
        }
    }
}
