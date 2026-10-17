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
            use_fast_model=True
        )
        out = result.model_dump()

        if not out.get("scenes") or len(out["scenes"]) == 0:
            out["title"] = f"Video Briefing: {topic}"
            out["scenes"] = [
                {
                    "scene_number": 1,
                    "duration": 8.0,
                    "visual_recommendation": f"Incident monitoring center assessing {topic}",
                    "voiceover_text": f"Emergency briefing: {topic} reported. Urgency level: {severity}.",
                    "subtitle_text": f"UPDATE: {topic}",
                    "image_prompt": f"Municipal operations command center, digital map displays showing {topic}"
                },
                {
                    "scene_number": 2,
                    "duration": 10.0,
                    "visual_recommendation": "Field response units and operational monitoring active across impacted sectors",
                    "voiceover_text": summary[:180] if summary else "Immediate response and relief measures deployed across affected areas.",
                    "subtitle_text": "OPERATIONAL RESPONSE ENGAGED",
                    "image_prompt": "Emergency response teams, municipal vehicles, situational overview map"
                }
            ]

        return out

video_agent = VideoAgent()
