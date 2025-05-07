using Microsoft.AspNetCore.Mvc;
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
            var combinedResults = new List<dynamic>();

            foreach (var w in words)
            {
                var wordInfos = _repository.GetWordInfosByWord(w);
                if (wordInfos == null || !wordInfos.Any())
                    continue;

                var result = wordInfos
                    .Select(info => new {
                        Url = info.UrlInfo?.URL,
                        Count = info.Count,
                        PageRank = info.PageRank,
                        Word = info.Word
                    });

                combinedResults.AddRange(result);
            }

            if (!string.IsNullOrEmpty(orderBy) && orderBy.ToLower() == "pagerank")
                combinedResults = combinedResults.OrderByDescending(x => x.PageRank).ToList();
            else if (!string.IsNullOrEmpty(orderBy) && orderBy.ToLower() == "count")
                combinedResults = combinedResults.OrderByDescending(x => x.Count).ToList();

            return Ok(combinedResults);
        }
    }
}