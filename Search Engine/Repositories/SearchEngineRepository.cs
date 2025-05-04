using Search_Engine.Models;

namespace Search_Engine.Repositories
{
    public class SearchEngineRepository : ISearchEngineRepository
    {
        private readonly AppDbContext _context;
        public SearchEngineRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<WordInfo> GetWordInfosByWord(string word)
        {
            return _context.WordInfos
                .Where(w => w.Word == word)
                .Select(w => new WordInfo
                {
                    Word = w.Word,
                    URL_Num = w.URL_Num,
                    Count = w.Count,
                    PageRank = w.PageRank,
                    UrlInfo = w.UrlInfo
                })
                .ToList();
        }
    }
}