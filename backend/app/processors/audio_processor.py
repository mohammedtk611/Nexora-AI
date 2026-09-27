import uuid
import os
from typing import Any, Dict, List

class AudioProcessor:
    def process_file(self, file_path: str, title: str = None) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found at {file_path}")

        audio_title = title or os.path.basename(file_path)
        full_transcript = ""
        timestamps: List[Dict[str, Any]] = []

        try:
            from faster_whisper import WhisperModel
            model = WhisperModel("tiny", device="cpu", compute_type="int8")
            segments, info = model.transcribe(file_path, beam_size=5)
            
            segment_texts = []
            for segment in segments:
                segment_texts.append(segment.text)
                timestamps.append({
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "text": segment.text.strip()
                })
            full_transcript = " ".join(segment_texts).strip()
        except Exception as e:
            full_transcript = f"[Audio Transcript Placeholder for {audio_title}: Speech recognition fallback due to: {str(e)}]"
            timestamps = [{"start": 0.0, "end": 10.0, "text": full_transcript}]

        return {
            "document_id": str(uuid.uuid4()),
            "source_type": "audio",
            "title": audio_title,
            "text": full_transcript,
            "language": "English",
            "metadata": {
                "file_path": file_path,
                "file_name": os.path.basename(file_path)
            },
            "pages": [{"page_number": 1, "text": full_transcript}],
            "media": [{"type": "audio", "path": file_path}],
            "entities": [],
            "timestamps": timestamps
        }

audio_processor = AudioProcessor()
