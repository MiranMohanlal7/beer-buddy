var builder = WebApplication.CreateBuilder(args);

// Controllers (voor bv. DrinksController)
builder.Services.AddControllers();

// OpenAPI/Swagger (handig om je endpoints te testen)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// CORS zodat je React frontend (http://localhost:5173) mag praten met de API
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()   // voor nu: alles toestaan (dev only)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Alleen in Development de OpenAPI UI beschikbaar maken
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // .NET 8 stijl i.p.v. oude Swagger extensie
}

app.UseHttpsRedirection();

app.UseCors();

// Koppel alle controllers (zoals /api/drinks)
app.MapControllers();

app.Run();
