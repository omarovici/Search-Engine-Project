using System.ComponentModel.DataAnnotations;

namespace Search_Engine.Models
{
    public class UrlInfo
    {
        [Key]
        public int URL_Num { get; set; }
        public string URL { get; set; }
    }
}