using System.Collections.Generic;
using Search_Engine.Models;

namespace Search_Engine.Repositories
{
    public interface ISearchEngineRepository
    {
        List<WordInfo> GetWordInfosByWord(string word);
    }
}