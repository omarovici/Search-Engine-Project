# Search-Engine-Project

A simple web-based search engine API built with ASP.NET Core (.NET 8), Entity Framework Core, and SQL Server. This project demonstrates how to build a basic search engine backend that indexes words and URLs, and exposes endpoints for querying word occurrences and page ranks.

## Features
- RESTful API for searching words and retrieving associated URLs
- Results can be ordered by word count or PageRank
- Entity Framework Core for data access
- Swagger/OpenAPI documentation for easy API exploration
- Modular repository pattern for data access abstraction

## Project Structure
```
Search-Engine-Project/
├── README.md
└── Search Engine/
    ├── Controllers/
    ├── Data/
    ├── Migrations/
    ├── Models/
    ├── Program.cs
    ├── Repositories/
    ├── appsettings.json
    └── ...
```

## Getting Started
### Prerequisites
- .NET 8 SDK
- SQL Server (or compatible connection string)

### Setup
1. Clone the repository:
    ```bash
    git clone https://github.com/omarovici/Search-Engine-Project.git
    cd Search-Engine-Project
    ```
2. Configure the database:
    - Update the `DefaultConnection` string in `Search Engine/appsettings.Development.json` and/or `appsettings.json` to point to your SQL Server instance.
3. Apply migrations (if using EF Core migrations):
    ```bash
    cd "Search Engine"
    dotnet ef database update
    ```
4. Run the project:
    ```bash
    dotnet run
    ```
5. Access the API:
    - By default, the API will be available at `https://localhost:<port>/api/SearchEngine`
    - Swagger UI is available at `https://localhost:<port>/swagger`

## API Usage
### Search Endpoint
- **GET** `/api/SearchEngine?word={word}&orderBy={orderBy}`
    - `word`: The word to search for
    - `orderBy`: `pagerank` or `count` (optional)
- **Response Example:**
    ```json
    [
      {
        "Url": "http://example.com",
        "Count": 5,
        "PageRank": 0.85
      }
    ]
    ```

## Technologies Used
- ASP.NET Core (.NET 8)
- Entity Framework Core
- SQL Server
- Swagger (Swashbuckle)
- C#

## License
This project is licensed under the MIT License.

Feel free to contribute or open issues for improvements!

The README is now ready and provides all the necessary information for users to understand, set up, and run your project.