from typing import Any, Dict, List
from pydantic import BaseModel, Field
from app.models.llm import llm_service
from app.agents.state import TransformationState

class VideoScene(BaseModel):
    scene_number: int = 1
    duration: float = 8.0
    visual_recommendation: str = ""
    voiceover_text: str = ""
    subtitle_text: str = ""
    image_prompt: str = ""

class VideoScriptOutput(BaseModel):
    title: str = "Cybersecurity Intelligence Video Script"
    total_duration: float = 30.0
    scenes: List[VideoScene] = Field(default_factory=list)

class VideoAgent:
    def run(self, state: TransformationState) -> Dict[str, Any]:
        ctx = state.central_context
        topic = ctx.core_topic if ctx and ctx.core_topic else "Cybersecurity Alert"
        summary = ctx.executive_summary if ctx and ctx.executive_summary else "Security breach investigation."
        severity = ctx.severity if ctx and ctx.severity else ctx.urgency_level.upper() if ctx else "HIGH"

        prompt = f"""
You are the Video Script & Storyboard Director Agent.
Create a scene-by-scene Video Package Script based on the Central Context.

Central Context:
Core Topic: {topic}
Executive Summary: {summary}
Severity: {severity}

Generate 3 to 5 concise scenes (duration 5-10s each).
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=VideoScriptOutput,
            system_prompt="You create multimedia video storyboards and voiceover scripts.",
            use_fast_model=False
        )
        out = result.model_dump()

        if not out.get("scenes") or len(out["scenes"]) == 0:
            out["title"] = f"Video Briefing: {topic}"
            out["scenes"] = [
                {
                    "scene_number": 1,
                    "duration": 8.0,
                    "visual_recommendation": "Cybersecurity SOC monitoring room with red warning indicators",
                    "voiceover_text": f"Critical security alert: {topic} confirmed. Severity: {severity}.",
                    "subtitle_text": f"ALERT: {topic}",
                    "image_prompt": "Dark cybersecurity control room, futuristic UI, alert dialog"
                },
                {
                    "scene_number": 2,
                    "duration": 10.0,
                    "visual_recommendation": "Network topology showing isolated domain controller",
                    "voiceover_text": summary if summary else "Immediate containment protocols engaged across affected infrastructure.",
                    "subtitle_text": "CONTAINMENT IN PROGRESS",
                    "image_prompt": "Abstract digital network map, glowing nodes, red threat alert"
                }
            ]

        return out

video_agent = VideoAgent()
