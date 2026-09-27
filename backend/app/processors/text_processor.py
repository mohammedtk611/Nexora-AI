import uuid
from typing import Any, Dict

class TextProcessor:
    def process(self, text: str, title: str = "Raw Text Document") -> Dict[str, Any]:
        cleaned_text = text.strip() if text else ""
        lines = [line for line in cleaned_text.splitlines() if line.strip()]
        
        return {
            "document_id": str(uuid.uuid4()),
            "source_type": "text",
            "title": title,
            "text": cleaned_text,
            "language": "English",
            "metadata": {
                "char_count": len(cleaned_text),
                "line_count": len(lines)
            },
            "pages": [{"page_number": 1, "text": cleaned_text}],
            "media": [],
            "entities": [],
            "timestamps": []
        }

text_processor = TextProcessor()
