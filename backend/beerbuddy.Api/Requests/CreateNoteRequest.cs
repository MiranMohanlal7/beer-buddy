using System.ComponentModel.DataAnnotations;

namespace beerbuddy.Api.Requests;

public class CreateNoteRequest
{
    [Required]
    [MaxLength(100)]
    public string Author { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Text { get; set; } = string.Empty;
}
