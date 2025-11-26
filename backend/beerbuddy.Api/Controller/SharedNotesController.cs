using beerbuddy.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace beerbuddy.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SharedNotesController : ControllerBase
    {
        private readonly BrewBuddyContext _context;

        public SharedNotesController(BrewBuddyContext context)
        {
            _context = context;
        }

    
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var notes = await _context.SharedNotes
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notes);
        }

      
        [HttpPost]
        public async Task<IActionResult> Add(SharedNote note)
        {
            note.CreatedAt = DateTime.Now;

            _context.SharedNotes.Add(note);
            await _context.SaveChangesAsync();

            return Ok(note);
        }
    }
}
