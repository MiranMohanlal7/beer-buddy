using beerbuddy.Api.Data;
using beerbuddy.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace beerbuddy.Api.Repositories
{
    public class NoteRepository : INoteRepository
    {
        private readonly AppDbContext _context;

        public NoteRepository(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Note> GetAll()
        {
            return _context.Notes
                .OrderByDescending(n => n.CreatedAt)
                .ToList();
        }

        public Note GetById(int id)
        {
            return _context.Notes.Find(id);
        }

        public async Task<Note> AddAsync(Note note)
        {
            _context.Notes.Add(note);
            await _context.SaveChangesAsync();
            return note;
        }

        public async Task DeleteAsync(int id)
        {
            var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id);
            if (note != null)
            {
                _context.Notes.Remove(note);
            }
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
