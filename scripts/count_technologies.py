import json
import logging

README_FILE_NAME = 'README.md'
TECHNOLOGIES_KEY = "**Technologies:**"

logging.basicConfig(level=logging.INFO)

def extract_technologies():
    technologies_map = {}
    with open(README_FILE_NAME, 'r', encoding='utf-8') as file:
        for line in file:
            if not TECHNOLOGIES_KEY in line: continue
            technologies = line.split(TECHNOLOGIES_KEY)[1].strip().split(", ")
            for tech in technologies:
                if tech not in technologies_map: technologies_map[tech] = 1
                else: technologies_map[tech] += 1
    return technologies_map

def main():
    technology_count = extract_technologies()
    technology_count = dict(sorted(technology_count.items(), key=lambda item: item[0]))
    logging.info(json.dumps(technology_count, indent=2))

if __name__ == "__main__":
    main()
