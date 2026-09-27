import uuid
import os
from typing import Any, Dict

class PDFProcessor:
    def process_file(self, file_path: str, title: str = None) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found at {file_path}")

        doc_title = title or os.path.basename(file_path)
        pages_content = []
        full_text = []

        try:
            import fitz  # PyMuPDF
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text()
                pages_content.append({
                    "page_number": page_num + 1,
                    "text": text
                })
                full_text.append(text)
            doc.close()
        except Exception:
            # Fallback to pypdf
            try:
                import pypdf
                reader = pypdf.PdfReader(file_path)
                for idx, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    pages_content.append({
                        "page_number": idx + 1,
                        "text": text
                    })
                    full_text.append(text)
            except Exception as e:
                full_text = [f"Error extracting PDF text: {str(e)}"]

        combined_text = "\n\n".join(full_text).strip()

        return {
            "document_id": str(uuid.uuid4()),
            "source_type": "pdf",
            "title": doc_title,
            "text": combined_text,
            "language": "English",
            "metadata": {
                "file_path": file_path,
                "total_pages": len(pages_content)
            },
            "pages": pages_content,
            "media": [],
            "entities": [],
            "timestamps": []
        }

pdf_processor = PDFProcessor()
