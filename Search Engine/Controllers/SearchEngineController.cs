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
            var wordInfos = _repository.GetWordInfosByWord(word);
            if (wordInfos == null || !wordInfos.Any())
                return NotFound();

            var result = wordInfos
                .Select(w => new {
                    Url = w.UrlInfo?.URL,
                    Count = w.Count,
                    PageRank = w.PageRank
                });

            if (orderBy.ToLower() == "pagerank")
                result = result.OrderByDescending(x => x.PageRank);
            else if (orderBy.ToLower() == "count")
                result = result.OrderByDescending(x => x.Count);

            return Ok(result.ToList());
        }
    }
}