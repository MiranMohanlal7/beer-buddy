namespace beerbuddy.Api.Models;

public class BeerInventory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int UnitWeight { get; set; }      // weight per full unit (grams)
    public int UnitEmpty { get; set; }       // tare weight for the compartment or crate (grams)
    public int CurrentWeight { get; set; }   // current combined weight in compartment (grams)
    public int MaxWeight { get; set; }       // maximum weight the compartment can hold (grams)
}
