import json
import logging
import markdown2
import requests
from bs4 import BeautifulSoup

README_FILE_NAME = 'README.md'

def extract_links():
    with open(README_FILE_NAME, 'r', encoding='utf-8') as file: markdown_text = file.read()
    html = markdown2.markdown(markdown_text)
    soup = BeautifulSoup(html, 'html.parser')
    links = [a['href'] for a in soup.find_all('a', href=True)]
    links = [link for link in links if link.startswith('http')]
    return links

def check_links_status(links):
    failed = []
    for link in links:
        try:
            response = requests.head(link, allow_redirects=True)
            if response.status_code == 200: 
                logging.info(f"Link OK: {link}")
            else:
                failed.append(link) 
                logging.error(f"Link failed with status {response.status_code}: {link}")
        except requests.exceptions.RequestException as e:
            failed.append(link)
            logging.error(f"Error accessing {link}: {e}")

def main():
    links = extract_links()
    failed_links = check_links_status(links)
    logging.info(json.dumps(failed_links, indent=2))

if __name__ == "__main__":
    main()
