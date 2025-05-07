import os
import json
import re
from collections import defaultdict

CONTENT_DIR = os.path.join(os.path.dirname(__file__), 'data', 'content')
JSONS_DIR = os.path.join(os.path.dirname(__file__), 'Jsons')
URL_MAP_PATH = os.path.join(JSONS_DIR, 'url_to_file_map.json')
PAGERANK_PATH = os.path.join(JSONS_DIR, 'pageRankResults.json')
OUTPUT_PATH = os.path.join(JSONS_DIR, 'inverted_index.txt')

def load_url_map():
    with open(URL_MAP_PATH, 'r', encoding='utf-8') as f: 
        return json.load(f)

def load_pagerank():
    with open(PAGERANK_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def tokenize(text):
    # Tokenize, remove digits from words, and filter out empty or non-alpha words
    words = re.findall(r'\b\w+\b', text.lower())
    cleaned = []
    for word in words:
        new_word = re.sub(r'\d+', '', word)
        if new_word and any(c.isalpha() for c in new_word):
            cleaned.append(new_word)
    return cleaned

def main():
    print('Starting inverted index build...')
    url_map = load_url_map()  # file_num (str) -> url
    pagerank = load_pagerank()  # url -> pagerank (str)
    inverted = defaultdict(lambda: defaultdict(lambda: [0, '0']))

    files = [f for f in os.listdir(CONTENT_DIR)]
    total_files = len(files)
    print(f'Total files to process: {total_files}')

    for idx, filename in enumerate(files, 1):
        file_num = filename[:-4]  # remove .txt
        file_path = os.path.join(CONTENT_DIR, filename)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                words = tokenize(f.read())
        except Exception as e:
            print(f'Error reading {filename}: {e}')
            continue
        word_counts = defaultdict(int)
        for w in words:
            word_counts[w] += 1
        url = url_map.get(file_num)
        pr = pagerank.get(url, '0') if url else '0'
        for w, count in word_counts.items():
            inverted[w][file_num] = [count, pr]
        if idx % 100 == 0 or idx == total_files:
            print(f'Processed {idx}/{total_files} files...')

    print('Writing output...')
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as out:
        for word in sorted(inverted):
            entries = []
            for file_num, (count, pr) in inverted[word].items():
                entries.append(f"{file_num}:{count}:{pr}")
            out.write(f"{word}\t{';'.join(entries)}\n")
    print('Done! Output written to', OUTPUT_PATH)

if __name__ == '__main__':
    main()
