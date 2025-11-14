namespace beerbuddy.Api.Models;

public class Drink
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Quantity { get; set; }
    public int Threshold { get; set; }
    public string ImageUrl { get; set; }
}
