using Microsoft.AspNetCore.Mvc;
using beerbuddy.Api.Models;
using beerbuddy.Api.Repositories;

namespace beerbuddy.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly INoteRepository _repo;

        public NotesController(INoteRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_repo.GetAll());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var note = _repo.GetById(id);
            if (note == null)
                return NotFound();

            return Ok(note);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Note note)
        {
            note.CreatedAt = DateTime.UtcNow;

            var added = await _repo.AddAsync(note);
            return CreatedAtAction(nameof(GetById), new { id = added.Id }, added);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            await _repo.SaveAsync();

            return NoContent();
        }
    }
}
