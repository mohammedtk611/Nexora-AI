import os
import uuid

class LocalStorageManager:
    def __init__(self, base_dir: str = "storage"):
        # We assume 'storage' is at the root of the project
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", base_dir))
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir, exist_ok=True)

    def save_bytes(self, folder: str, filename: str, content: bytes) -> str:
        folder_path = os.path.join(self.base_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(folder_path, unique_filename)
        
        with open(file_path, "wb") as f:
            f.write(content)
            
        return file_path

    def get_path(self, folder: str, filename: str) -> str:
        folder_path = os.path.join(self.base_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        return os.path.join(folder_path, filename)

storage_manager = LocalStorageManager()
