using beerbuddy.Api.Data;
using beerbuddy.Api.Dtos;
using beerbuddy.Api.Models;
using beerbuddy.Api.Requests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace beerbuddy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly BrewBuddyContext _context;

    public NotesController(BrewBuddyContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FridgeNoteDto>>> GetNotes(CancellationToken cancellationToken)
    {
        var notes = await _context.SharedNotes.AsNoTracking()
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new FridgeNoteDto
            {
                Id = n.Id,
                Author = n.Name,
                Text = n.Message,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(notes);
    }

    [HttpPost]
    public async Task<ActionResult<FridgeNoteDto>> CreateNote(
        [FromBody] CreateNoteRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var note = new SharedNote
        {
            Name = request.Author.Trim(),
            Message = request.Text.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.SharedNotes.Add(note);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new FridgeNoteDto
        {
            Id = note.Id,
            Author = note.Name,
            Text = note.Message,
            CreatedAt = note.CreatedAt
        };

        return CreatedAtAction(nameof(GetNotes), new { id = note.Id }, dto);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteNote(int id, CancellationToken cancellationToken)
    {
        var note = await _context.SharedNotes.FindAsync(new object?[] { id }, cancellationToken);
        if (note == null)
        {
            return NotFound();
        }

        _context.SharedNotes.Remove(note);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
