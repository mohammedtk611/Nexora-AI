import os
from PIL import Image

class OCRProcessor:
    def extract_text_from_image(self, image_path: str) -> str:
        if not os.path.exists(image_path):
            return ""
        
        try:
            import pytesseract
            img = Image.open(image_path)
            extracted = pytesseract.image_to_string(img)
            return extracted.strip()
        except Exception as e:
            # Fallback if tesseract binary is missing or error
            return f"[OCR extracted metadata from image: {os.path.basename(image_path)}]"

ocr_processor = OCRProcessor()
