using Microsoft.AspNetCore.Mvc;
using beerbuddy.Api.Models;

namespace beerbuddy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DrinksController : ControllerBase
{
    // TESTDATA (GEEN DATABASE NODIG)
    private static readonly List<Drink> Drinks = new()
    {
        new Drink { Id = 1, Name = "Heineken", Quantity = 12, Threshold = 6, ImageUrl = "https://dummyimage.com/100x100/000/fff&text=Heineken" },
        new Drink { Id = 2, Name = "Corona", Quantity = 8, Threshold = 4, ImageUrl = "https://dummyimage.com/100x100/000/fff&text=Corona" },
        new Drink { Id = 3, Name = "Coca Cola", Quantity = 5, Threshold = 3, ImageUrl = "https://dummyimage.com/100x100/000/fff&text=CocaCola" },
        new Drink { Id = 4, Name = "Fanta", Quantity = 26, Threshold = 10, ImageUrl = "https://dummyimage.com/100x100/000/fff&text=Fanta" }
    };

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(Drinks);
    }
}
