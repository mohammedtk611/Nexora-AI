import uuid
import os
import subprocess
from typing import Any, Dict
from app.processors.audio_processor import audio_processor

class VideoProcessor:
    def process_file(self, file_path: str, title: str = None) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Video file not found at {file_path}")

        video_title = title or os.path.basename(file_path)
        
        # Try extracting audio using ffmpeg if available
        audio_extracted_path = file_path + ".mp3"
        extracted_audio = False

        try:
            cmd = ["ffmpeg", "-y", "-i", file_path, "-vn", "-acodec", "libmp3lame", audio_extracted_path]
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            extracted_audio = os.path.exists(audio_extracted_path)
        except Exception:
            extracted_audio = False

        target_path = audio_extracted_path if extracted_audio else file_path
        
        audio_result = audio_processor.process_file(target_path, title=video_title)
        
        if extracted_audio and os.path.exists(audio_extracted_path):
            try:
                os.remove(audio_extracted_path)
            except Exception:
                pass

        audio_result["source_type"] = "video"
        audio_result["metadata"]["file_path"] = file_path
        audio_result["media"] = [{"type": "video", "path": file_path}]

        return audio_result

video_processor = VideoProcessor()
