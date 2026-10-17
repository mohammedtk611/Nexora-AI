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
    title: str = "Executive Video Briefing Script"
    total_duration: float = 30.0
    scenes: List[VideoScene] = Field(default_factory=list)

class VideoAgent:
    def run(self, state: TransformationState) -> Dict[str, Any]:
        ctx = state.central_context
        topic = ctx.core_topic if ctx and ctx.core_topic else "Executive Briefing"
        summary = ctx.executive_summary if ctx and ctx.executive_summary else "Operational analysis and review."
        severity = ctx.severity if ctx and ctx.severity else ctx.urgency_level.upper() if ctx else "HIGH"

        prompt = f"""
You are the Video Script & Storyboard Director Agent for Nexora AI.
Create a scene-by-scene Video Package Script based on the Central Context.

Central Context:
Core Topic: {topic}
Executive Summary: {summary}
Urgency / Severity: {severity}

Generate 3 to 4 concise scenes (duration 6-10s each) tailored directly to {topic}:
- Scene 1: Introduction and Situation Context
- Scene 2: Key Operational Observations & Findings
- Scene 3: Impact Analysis & Mitigation Steps
- Scene 4: Conclusion & Action Directives
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=VideoScriptOutput,
            system_prompt="You create professional video storyboards and voiceover scripts tailored precisely to the subject topic.",
            use_fast_model=True
        )
        out = result.model_dump()

        if not out.get("scenes") or len(out["scenes"]) == 0:
            out["title"] = f"Video Briefing: {topic}"
            out["scenes"] = [
                {
                    "scene_number": 1,
                    "duration": 8.0,
                    "visual_recommendation": f"Executive briefing room with telemetry screens displaying key metrics for {topic}",
                    "voiceover_text": f"Executive briefing on {topic}. Status assessed at priority level {severity}.",
                    "subtitle_text": f"STATUS UPDATE: {topic}",
                    "image_prompt": f"Professional corporate command dashboard showing analytical graphs for {topic}"
                },
                {
                    "scene_number": 2,
                    "duration": 10.0,
                    "visual_recommendation": f"Data analysis visualization depicting operational impact and monitored sectors",
                    "voiceover_text": summary[:160] if summary else f"Cross-functional teams are coordinating active mitigation for {topic}.",
                    "subtitle_text": "OPERATIONAL CONTINUITY ENGAGED",
                    "image_prompt": f"Modern analytical charts and process maps illustrating operational workflows"
                },
                {
                    "scene_number": 3,
                    "duration": 8.0,
                    "visual_recommendation": "Executive leadership reviewing milestone checklist and action items",
                    "voiceover_text": "Immediate remediation protocols are active with regular progress checkpoints scheduled.",
                    "subtitle_text": "ACTION PLAN IN PROGRESS",
                    "image_prompt": "Leadership team collaborating on strategic roadmaps and next steps"
                }
            ]

        return out

video_agent = VideoAgent()
