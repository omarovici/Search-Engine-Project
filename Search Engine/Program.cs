using Microsoft.EntityFrameworkCore;
using Search_Engine.Models;
using Search_Engine.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddScoped<ISearchEngineRepository, SearchEngineRepository>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<ISearchEngineRepository, SearchEngineRepository>();

builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAll", policy =>
		policy.AllowAnyOrigin()
			.AllowAnyHeader()
			.AllowAnyMethod());
});

var app = builder.Build();

// Automatically apply migrations at startup
using (var scope = app.Services.CreateScope())
{
    // var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // db.Database.Migrate();

    // if (!db.UrlInfos.Any() && !db.WordInfos.Any())
    // {
    //     var urlInfoPath = Environment.GetEnvironmentVariable("/Users/macbook/Desktop/UrlInfos.csv");
    //     var wordInfoPath = Environment.GetEnvironmentVariable("/Users/macbook/Desktop/WordInfos.csv");
    //     if (!string.IsNullOrEmpty(urlInfoPath) && File.Exists(urlInfoPath))
    //     {
    //         var urlLines = File.ReadAllLines(urlInfoPath);
    //         foreach (var line in urlLines)
    //         {
    //             var parts = line.Split(',');
    //             if (parts.Length >= 2)
    //             {
    //                 db.UrlInfos.Add(new UrlInfo
    //                 {
    //                     URL_Num = int.Parse(parts[0].Trim()),
    //                     URL = parts[1].Trim()
    //                 });
    //             }
    //         }
    //     }
    //     if (!string.IsNullOrEmpty(wordInfoPath) && File.Exists(wordInfoPath))
    //     {
    //         var wordLines = File.ReadAllLines(wordInfoPath);
    //         foreach (var line in wordLines)
    //         {
    //             var parts = line.Split(',');
    //             if (parts.Length >= 4)
    //             {
    //                 db.WordInfos.Add(new WordInfo
    //                 {
    //                     Word = parts[0].Trim(),
    //                     URL_Num = int.Parse(parts[1].Trim()),
    //                     Count = int.Parse(parts[2].Trim()),
    //                     PageRank = double.Parse(parts[3].Trim(), System.Globalization.CultureInfo.InvariantCulture)
    //                 });
    //             }
    //         }
    //     }
    //     db.SaveChanges();
    // }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
	app.UseCors("AllowAll");
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
