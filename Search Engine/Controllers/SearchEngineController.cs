using Microsoft.AspNetCore.Mvc;
using Search_Engine.Models;
using Search_Engine.Repositories;
using System.Linq;

namespace Search_Engine.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchEngineController : ControllerBase
    {
        private readonly ISearchEngineRepository _repository;
        public SearchEngineController(ISearchEngineRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public IActionResult Get(string word, string orderBy)
        {
            if (string.IsNullOrWhiteSpace(word))
                return BadRequest("No search word provided.");

            var words = word.Split(' ', StringSplitOptions.RemoveEmptyEntries); 
            if (words.Length == 0)
                return BadRequest("No valid search words provided.");

            if (words.Length == 1)
            {
                var wordInfos = _repository.GetWordInfosByWord(words[0])?.ToList() ?? new List<WordInfo>();
                var results = wordInfos.Select(info => new {
                    Url = info.UrlInfo?.URL,
                    Count = info.Count,
                    PageRank = info.PageRank
                }).ToList();

                if (!string.IsNullOrEmpty(orderBy) && orderBy.ToLower() == "pagerank")
                    results = results.OrderByDescending(x => x.PageRank).ToList();
                else if (!string.IsNullOrEmpty(orderBy) && orderBy.ToLower() == "count")
                    results = results.OrderByDescending(x => x.Count).ToList();

                return Ok(results);
            }

            var wordInfosList = words.Select(w => _repository.GetWordInfosByWord(w)?.ToList() ?? new List<WordInfo>()).ToList();
// [ EGYPT SA ABC ] // [ URL1 URL2 .. ]
            var commonUrls = wordInfosList
                .Select(list => list.Select(info => info.UrlInfo?.URL).Where(url => url != null).ToHashSet())
                .Aggregate((set1, set2) => { set1.IntersectWith(set2); return set1; });

            var combinedResults = new List<dynamic>();
            foreach (var url in commonUrls)
            {
                int totalCount = 0;
                double? pageRank = null;
                foreach (var wordInfos in wordInfosList)
                {
                    var info = wordInfos.FirstOrDefault(i => i.UrlInfo?.URL == url);
                    if (info != null)
                    {
                        totalCount += info.Count;
                        pageRank = info.PageRank;
                    }
                }
                combinedResults.Add(new { Url = url, Count = totalCount, PageRank = pageRank });
            }

            if (!string.IsNullOrEmpty(orderBy) && orderBy.ToLower() == "pagerank")
                combinedResults = combinedResults.OrderByDescending(x => x.PageRank).ToList();
            else if (!string.IsNullOrEmpty(orderBy) && orderBy.ToLower() == "count")
                combinedResults = combinedResults.OrderByDescending(x => x.Count).ToList();

            return Ok(combinedResults);
        }
    }
}