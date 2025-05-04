import json
import os

def calculate_pagerank(links_graph, damping_factor=0.85, iterations=50):
    print("Starting PageRank calculation...")
    pages = list(links_graph.keys())
    num_pages = len(pages)
    page_rank = {page: 1.0 / num_pages for page in pages}

    links_graph_set = {page: set(links_graph[page]) for page in links_graph}

    for i in range(iterations):
        print(f"Iteration {i + 1}/{iterations}...")
        new_page_rank = {}
        for page in pages:
            inbound_sum = 0.0
            for inner_page in pages:
                if page in links_graph_set[inner_page]:
                    inbound_sum += page_rank[inner_page] / len(links_graph[inner_page])
            new_page_rank[page] = (1 - damping_factor) / num_pages + damping_factor * inbound_sum
        page_rank = new_page_rank

    print("PageRank calculation completed.")
    sorted_pages = sorted(page_rank, key=page_rank.get, reverse=True)
    data = {page: f"{page_rank[page]:.10f}" for page in sorted_pages}
    return data

if __name__ == "__main__":
    print("Script started.")
    base_dir = os.path.dirname(__file__)
    JSONS_DIR = os.path.join(base_dir, "Jsons")
    print("Loading links graph...")
    with open(os.path.join(JSONS_DIR, "links_graph.json"), "r", encoding="utf-8") as f:
        links_graph = json.load(f)
    print("Links graph loaded.")
    
    print("Calculating PageRank...")
    results = calculate_pagerank(links_graph)
    
    print("Saving PageRank results...")
    with open(os.path.join(JSONS_DIR, "pageRankResults.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print("PageRank results written to pageRankResults.json")
    print("Script finished.")