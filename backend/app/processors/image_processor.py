import uuid
import os
from typing import Any, Dict
from app.processors.ocr_processor import ocr_processor

class ImageProcessor:
    def process_file(self, file_path: str, title: str = None) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Image file not found at {file_path}")

        img_title = title or os.path.basename(file_path)
        extracted_text = ocr_processor.extract_text_from_image(file_path)
        if not extracted_text:
            extracted_text = f"Image content from {img_title}"

        return {
            "document_id": str(uuid.uuid4()),
            "source_type": "image",
            "title": img_title,
            "text": extracted_text,
            "language": "English",
            "metadata": {
                "file_path": file_path,
                "file_name": os.path.basename(file_path)
            },
            "pages": [{"page_number": 1, "text": extracted_text}],
            "media": [{"type": "image", "path": file_path}],
            "entities": [],
            "timestamps": []
        }

image_processor = ImageProcessor()
