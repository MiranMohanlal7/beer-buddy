namespace beerbuddy.Api.Models
{
    public class Note
    {
        public int Id { get; set; }
        public string Name { get; set; }     // user-entered
        public string Message { get; set; }  // text content
        public DateTime CreatedAt { get; set; }
    }
}
