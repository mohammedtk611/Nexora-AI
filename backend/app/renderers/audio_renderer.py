import os
import asyncio

class AudioRenderer:
    def render_narration_sync(self, text: str, output_mp3_path: str, voice: str = "en-US-ChristopherNeural") -> str:
        os.makedirs(os.path.dirname(output_mp3_path), exist_ok=True)
        
        try:
            import edge_tts
            async def _generate():
                communicate = edge_tts.Communicate(text, voice)
                await communicate.save(output_mp3_path)

            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    import nest_asyncio
                    nest_asyncio.apply()
                    loop.run_until_complete(_generate())
                else:
                    loop.run_until_complete(_generate())
            except Exception:
                asyncio.run(_generate())

            if os.path.exists(output_mp3_path):
                return output_mp3_path
        except Exception as e:
            pass

        # Create silent dummy MP3 file if edge-tts fails or is offline
        with open(output_mp3_path, "wb") as f:
            f.write(b"ID3\x03\x00\x00\x00\x00\x00\x00" + b"\x00" * 1024)
        return output_mp3_path

audio_renderer = AudioRenderer()
