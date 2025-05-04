import os
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time
from chardet import detect
CONTENT_DIR = os.path.join(os.path.dirname(__file__), "data/content")

if not os.path.exists(CONTENT_DIR):
    os.makedirs(CONTENT_DIR)

JSONS_DIR = os.path.join(os.path.dirname(__file__), "Jsons")
if not os.path.exists(JSONS_DIR):
    os.makedirs(JSONS_DIR)

START_URLS = [
    "https://www.reuters.com/",
    "https://www.nbcnews.com/",
    "https://www.empireonline.com/",
    "https://www.nytimes.com/athletic/",
    "https://www.bbc.com/",
    "https://cnn.com/",
    "https://www.goal.com/en-us",
    "https://www.theguardian.com/international",
    "https://www.geeksforgeeks.org/",
    "https://www.skysports.com/",
]

MAX_PAGES = 10000

pages_to_visit = START_URLS[:]
visited_pages = {}
links_graph = {}
file_index = 1
url_to_file_map = {}

def fetch_page(url):
    try:
        response = requests.get(url, timeout=3)
        response.raise_for_status()

        content_type = response.headers.get("Content-Type", "")
        if "text/html" not in content_type:
            print(f"Skipped non-HTML content at {url} ({content_type})")
            return None

        # Try using apparent encoding
        if not response.encoding:
            detected = detect(response.content)
            response.encoding = detected["encoding"] or "utf-8"

        return BeautifulSoup(response.text, 'html.parser')
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None
    except Exception as e:
        print(f"Parsing error for {url}: {e}")
        return None

def save_content(url, content):
    global file_index
    file_name = f"{file_index}.txt"
    file_path = os.path.join(CONTENT_DIR, file_name)
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        url_to_file_map[file_name] = url
        file_index += 1
    except IOError as e:
        print(f"Error saving content for {url}: {e}")

def process_page(url):
    if url in visited_pages:
        return

    print(f"Visiting: {url}")
    soup = fetch_page(url)
    if not soup:
        return

    visited_pages[url] = True
    links_graph[url] = []

    for tag in ["script", "style", "noscript", "meta", "link", "img", "iframe", "svg", "video", "audio", "object", "embed", "applet", "area", "map", "param", "track", "source", "canvas", "math"]:
        for element in soup.find_all(tag):
            element.decompose()

    text_content = soup.get_text()
    text_content = " ".join(text_content.split())
    save_content(url, text_content)

    for link in soup.find_all("a", href=True):
        href = link["href"]
        absolute_url = urljoin(url, href)
        if absolute_url not in visited_pages and absolute_url not in pages_to_visit:
            pages_to_visit.append(absolute_url)
            links_graph[url].append(absolute_url)

def crawl():
    global pages_to_visit
    while pages_to_visit and len(visited_pages) < MAX_PAGES:
        batch = pages_to_visit[:5]
        pages_to_visit = pages_to_visit[5:]
        for url in batch:
            process_page(url)

    print("Crawling finished.")

    with open(os.path.join(JSONS_DIR, "links_graph.json"), "w", encoding="utf-8") as f:
        json.dump(links_graph, f, indent=2)
        print("Links graph saved to links_graph.json.")

    with open(os.path.join(JSONS_DIR, "url_to_file_map.json"), "w", encoding="utf-8") as f:
        json.dump(url_to_file_map, f, indent=2)
        print("URL to file map saved to url_to_file_map.json.")

if __name__ == "__main__":
    start_time = time.time()
    print("Starting crawl...")
    
    crawl()
    
    end_time = time.time()
    elapsed_time = end_time - start_time
    hours, remainder = divmod(elapsed_time, 3600)
    minutes, seconds = divmod(remainder, 60)
    print(f"Crawl completed in {int(hours):02}:{int(minutes):02}:{int(seconds):02} (hh:mm:ss).")
    
    print(f"Total pages visited: {len(visited_pages)}")