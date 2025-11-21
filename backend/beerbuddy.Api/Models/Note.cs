using System;
using System.ComponentModel.DataAnnotations; 

public class Note
{
    [Key] 
    public int id { get; set;}

    public string name { get; set;}

    public string message { get; set;}

    public DateTime created_at { get; set;}
}