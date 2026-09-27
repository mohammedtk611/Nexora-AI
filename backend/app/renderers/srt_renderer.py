import os
from typing import Any, Dict, List

class SRTRenderer:
    def format_timestamp(self, seconds: float) -> str:
        hrs = int(seconds // 3600)
        mins = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds - int(seconds)) * 1000)
        return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

    def render_srt(self, scenes: List[Dict[str, Any]], output_srt_path: str) -> str:
        os.makedirs(os.path.dirname(output_srt_path), exist_ok=True)
        
        current_time = 0.0
        lines = []

        for idx, scene in enumerate(scenes, start=1):
            duration = float(scene.get("duration", 8.0))
            end_time = current_time + duration
            
            start_str = self.format_timestamp(current_time)
            end_str = self.format_timestamp(end_time)
            subtitle_text = scene.get("subtitle_text") or scene.get("voiceover_text") or f"Scene {idx}"

            lines.append(str(idx))
            lines.append(f"{start_str} --> {end_str}")
            lines.append(subtitle_text)
            lines.append("")

            current_time = end_time

        srt_content = "\n".join(lines)
        with open(output_srt_path, "w", encoding="utf-8") as f:
            f.write(srt_content)

        return output_srt_path

srt_renderer = SRTRenderer()
