# Search-Engine-Project

A comprehensive web-based search engine solution built with ASP.NET Core (.NET 8), Entity Framework Core, SQL Server, and Python for data processing. This project demonstrates crawling, indexing, ranking, and searching web pages, with a modern frontend and robust backend API.

---

## Table of Contents
- [Project Structure & Folder Overview](#project-structure--folder-overview)
- [Folder & File Explanations](#folder--file-explanations)
- [How to Clone and Run the Full Project](#how-to-clone-and-run-the-full-project)
- [API Usage & Examples](#api-usage--examples)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Contribution Guidelines](#contribution-guidelines)
- [Credits & Acknowledgments](#credits--acknowledgments)
- [Technologies Used](#technologies-used)
- [Security & Performance Notes](#security--performance-notes)
- [Future Improvements & Roadmap](#future-improvements--roadmap)
- [License](#license)

---

## Folder & File Explanations

#### Engine Scripts
- [crawler.py](Engine%20Scripts/crawler.py): Crawls web pages and collects data for indexing.
- [inverted_index.py](Engine%20Scripts/inverted_index.py): Builds an inverted index mapping words to URLs for fast search.
- [pageRank.py](Engine%20Scripts/pageRank.py): Calculates PageRank scores for each URL.
- [Jsons/links_graph.json](Engine%20Scripts/Jsons/links_graph.json): The web graph structure.
- [Jsons/pageRankResults.json](Engine%20Scripts/Jsons/pageRankResults.json): PageRank scores for URLs.
- [Jsons/url_to_file_map.json](Engine%20Scripts/Jsons/url_to_file_map.json): Maps URLs to local files.

#### Frontend/search-ui
- [index.html](Frontend/search-ui/index.html): Main HTML file for the search UI.
- [script.js](Frontend/search-ui/script.js): Handles search requests, result rendering, modal logic, and UI interactivity.
- [style.css](Frontend/search-ui/style.css): Styles the search UI, including dark mode and responsive design.

#### Organize Scrapping Using Python
- [json_to_csv.py](Organize%20Scrapping%20Using%20Python/json_to_csv.py): Converts JSON data to CSV for analysis or import.
- [process_input.py](Organize%20Scrapping%20Using%20Python/process_input.py): Processes and cleans input data for the engine.

#### Search Engine (ASP.NET Core Backend)
- [Controllers/SearchEngineController.cs](Search%20Engine/Controllers/SearchEngineController.cs): Exposes the API endpoint for searching words and retrieving URLs, supporting ordering by count or PageRank.
- [Data/AppDbContext.cs](Search%20Engine/Data/AppDbContext.cs): Entity Framework Core context for database access.
- [Migrations/20250503214727_InitialCreate.cs](Search%20Engine/Migrations/20250503214727_InitialCreate.cs): Initial database migration.
- [Migrations/20250503214727_InitialCreate.Designer.cs](Search%20Engine/Migrations/20250503214727_InitialCreate.Designer.cs): Designer file for migration.
- [Migrations/AppDbContextModelSnapshot.cs](Search%20Engine/Migrations/AppDbContextModelSnapshot.cs): Current database model snapshot.
- [Models/UrlInfo.cs](Search%20Engine/Models/UrlInfo.cs): Data model for URLs.
- [Models/WordInfo.cs](Search%20Engine/Models/WordInfo.cs): Data model for word occurrences.
- [Repositories/ISearchEngineRepository.cs](Search%20Engine/Repositories/ISearchEngineRepository.cs): Repository interface for data access abstraction.
- [Repositories/SearchEngineRepository.cs](Search%20Engine/Repositories/SearchEngineRepository.cs): Repository implementation for data access.
- [Program.cs](Search%20Engine/Program.cs): Main entry point and configuration for the ASP.NET Core app.
- [appsettings.json](Search%20Engine/appsettings.json): Configuration file for database connection and app settings.
- [appsettings.Development.json](Search%20Engine/appsettings.Development.json): Development configuration.

---

## How to Clone and Run the Full Project

### Prerequisites
- .NET 8 SDK
- Python 3.x (for engine scripts)
- SQL Server (or compatible connection string)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Search-Engine-Project
```

### 2. Prepare the Data (Python Engine)
- Navigate to `Engine Scripts/` and run the scripts in order:
  1. `crawler.py` to crawl and collect web data.
  2. `inverted_index.py` to build the index.
  3. `pageRank.py` to compute PageRank.
- Ensure the output JSON files are generated in `Engine Scripts/Jsons/`.
- (Optional) Use scripts in `Organize Scrapping Using Python/` for data cleaning or conversion.

### 3. Configure the Database
- Update the `DefaultConnection` string in `Search Engine/appsettings.Development.json` and/or `appsettings.json` to point to your SQL Server instance.

### 4. Apply Database Migrations
```bash
cd "Search Engine"
dotnet ef database update
```

### 5. Run the Backend API
```bash
dotnet run
```
- The API will be available at `https://localhost:<port>/api/SearchEngine`
- Swagger UI is available at `https://localhost:<port>/swagger`

### 6. Run the Frontend
- Open `Frontend/search-ui/index.html` in your browser.
- The frontend will connect to the backend API to perform searches and display results.

---

## API Usage & Examples

### Search Endpoint
- **GET** `/api/SearchEngine?word={word}&orderBy={orderBy}`
  - `word`: The word to search for (required)
  - `orderBy`: `pagerank` or `count` (optional, default: pagerank)

#### Example Request
```
GET https://localhost:5001/api/SearchEngine?word=python&orderBy=pagerank
```
#### Example Response
```json
[
  {
    "Url": "http://example.com/python-tutorial",
    "Count": 8,
    "PageRank": 0.92
  },
  {
    "Url": "http://another.com/python-guide",
    "Count": 5,
    "PageRank": 0.85
  }
]
```

#### Error Handling
- If no results are found, the API returns HTTP 404 Not Found.
- If parameters are missing or invalid, the API returns HTTP 400 Bad Request.

---

## Troubleshooting & FAQ

**Q: The API is not responding or returns 500 errors.**
- Check your database connection string in `appsettings.json`.
- Ensure SQL Server is running and accessible.
- Check for missing migrations or run `dotnet ef database update`.

**Q: The frontend does not display results.**
- Make sure the backend API is running and accessible at the expected URL.
- Check browser console for CORS or network errors.

**Q: Python scripts fail to run.**
- Ensure you have Python 3.x installed and all required packages (see script headers for requirements).

**Q: How do I reset the database?**
- Delete the database and run migrations again with `dotnet ef database update`.

---

## Contribution Guidelines

1. Fork the repository and create a new branch for your feature or bugfix.
2. Write clear, concise commit messages.
3. Ensure your code follows the existing style and conventions.
4. Add or update documentation and tests as needed.
5. Submit a pull request with a detailed description of your changes.

---

## Credits & Acknowledgments
- **Team Members:**
  - Abd El-Rahman Eldeeb (Web Scraper)
  - Omar Khalid (.NET Developer)
  - Shehap Yasser (Python Developer)
  - Haneen Hassan (Frontend Developer)
- **Special Thanks:**
  - Open source libraries and the .NET, Python, and SQL Server communities.

---

## Technologies Used
- ASP.NET Core (.NET 8)
- Entity Framework Core
- SQL Server
- Python 3.x
- JavaScript (ES6+)
- HTML5 & CSS3
- Swagger (Swashbuckle)
- Modern browser APIs

---

## Security & Performance Notes
- **Security:**
  - Always validate and sanitize user input.
  - Use HTTPS in production.
  - Restrict CORS as needed for your deployment.
- **Performance:**
  - Use database indexes on frequently queried columns.
  - Consider caching frequent queries.
  - Use pagination in the backend for large result sets.

---

## Future Improvements & Roadmap
- Add user authentication and personalized search history.
- Implement backend pagination and lazy loading for even faster responses.
- Add more advanced ranking algorithms and machine learning integration.
- Improve crawler to handle JavaScript-heavy sites.
- Add automated tests and CI/CD pipeline.
- Deploy demo version online.

---