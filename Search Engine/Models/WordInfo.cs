namespace Search_Engine.Models
{
    public class WordInfo
    {
        public string Word { get; set; }
        public int URL_Num { get; set; }
        public int Count { get; set; }
        public double PageRank { get; set; }
        public UrlInfo UrlInfo { get; set; }
        
    }
}