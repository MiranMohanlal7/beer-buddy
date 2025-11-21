using beerbuddy.Api.Models;

namespace beerbuddy.Api.Repositories
{
    public interface INoteRepository
    {
        IEnumerable<Note> GetAll();
        Note GetById(int id);
        Task<Note> AddAsync(Note note);
        Task DeleteAsync(int id);
        Task SaveAsync();
    }
}
