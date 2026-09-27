import os
import json
import zipfile
from typing import Any, Dict, List
from app.renderers.audio_renderer import audio_renderer
from app.renderers.srt_renderer import srt_renderer

class VideoPackageRenderer:
    def render_package(self, script_data: Dict[str, Any], output_zip_path: str) -> str:
        os.makedirs(os.path.dirname(output_zip_path), exist_ok=True)
        base_dir = os.path.dirname(output_zip_path)
        
        scenes = script_data.get("scenes", [])
        title = script_data.get("title", "Video Intelligence Package")
        
        # 1. Full voiceover text
        voiceover_parts = [scene.get("voiceover_text", "") for scene in scenes if scene.get("voiceover_text")]
        full_voiceover = " ".join(voiceover_parts) or f"Narration for {title}"

        # 2. Render Audio MP3
        mp3_path = os.path.join(base_dir, "narration.mp3")
        audio_renderer.render_narration_sync(full_voiceover, mp3_path)

        # 3. Render SRT Subtitles
        srt_path = os.path.join(base_dir, "subtitles.srt")
        srt_renderer.render_srt(scenes, srt_path)

        # 4. Write Storyboard JSON
        storyboard_path = os.path.join(base_dir, "storyboard.json")
        with open(storyboard_path, "w", encoding="utf-8") as f:
            json.dump(script_data, f, indent=2)

        # 5. Create ZIP Archive
        with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            if os.path.exists(mp3_path):
                zipf.write(mp3_path, arcname="narration.mp3")
            if os.path.exists(srt_path):
                zipf.write(srt_path, arcname="subtitles.srt")
            if os.path.exists(storyboard_path):
                zipf.write(storyboard_path, arcname="storyboard.json")

        # Cleanup temporary files
        for p in [mp3_path, srt_path, storyboard_path]:
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass

        return output_zip_path

video_package_renderer = VideoPackageRenderer()
