import json

input_json = "url_to_file_map.json"
output_csv = "output1.csv"

with open(input_json, "r", encoding="utf-8") as infile:
    data = json.load(infile)

with open(output_csv, "w", encoding="utf-8") as outfile:
    for key, url in data.items():
        # Remove .txt from key if present and write as number, url
        number = key.replace(".txt", "")
        outfile.write(f"{number}, {url}\n")