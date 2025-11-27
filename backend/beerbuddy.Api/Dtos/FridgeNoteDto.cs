namespace beerbuddy.Api.Dtos;

public class FridgeNoteDto
{
    public int Id { get; init; }
    public required string Author { get; init; }
    public required string Text { get; init; }
    public DateTime CreatedAt { get; init; }
}
