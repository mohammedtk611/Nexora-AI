import uuid
from typing import Any, Dict
import httpx
from bs4 import BeautifulSoup

class URLProcessor:
    def process_url(self, url: str, title: str = None) -> Dict[str, Any]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RevampAI/1.0"
        }
        
        extracted_text = ""
        extracted_title = title or url

        try:
            with httpx.Client(timeout=15.0, follow_redirects=True) as client:
                response = client.get(url, headers=headers)
                response.raise_for_status()
                html = response.text
                
                soup = BeautifulSoup(html, "html.parser")
                
                # Remove scripts and styles
                for element in soup(["script", "style", "nav", "header", "footer"]):
                    element.decompose()
                
                if not title and soup.title and soup.title.string:
                    extracted_title = soup.title.string.strip()
                
                paragraphs = [p.get_text().strip() for p in soup.find_all(["p", "h1", "h2", "h3", "li"]) if p.get_text().strip()]
                extracted_text = "\n\n".join(paragraphs)
        except Exception as e:
            extracted_text = f"Failed to fetch content from URL: {url}. Error: {str(e)}"

        return {
            "document_id": str(uuid.uuid4()),
            "source_type": "url",
            "title": extracted_title,
            "text": extracted_text,
            "language": "English",
            "metadata": {
                "url": url
            },
            "pages": [{"page_number": 1, "text": extracted_text}],
            "media": [],
            "entities": [],
            "timestamps": []
        }

url_processor = URLProcessor()
