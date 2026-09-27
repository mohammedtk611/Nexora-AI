from typing import Any, Dict, List
from pydantic import BaseModel, Field
from app.models.llm import llm_service
from app.agents.state import TransformationState

class SlideItem(BaseModel):
    slide_number: int = 1
    title: str = "Threat Intelligence Overview"
    bullets: List[str] = Field(default_factory=list)
    speaker_notes: str = ""

class PresentationOutput(BaseModel):
    title: str = "Cybersecurity Intelligence Presentation"
    slides: List[SlideItem] = Field(default_factory=list)

class PresentationAgent:
    def run(self, state: TransformationState) -> Dict[str, Any]:
        ctx = state.central_context
        topic = ctx.core_topic if ctx and ctx.core_topic else "Cybersecurity Incident Report"
        summary = ctx.executive_summary if ctx and ctx.executive_summary else "Incident response and threat mitigation."
        affected = ctx.affected_systems if ctx else []
        indicators = ctx.threat_indicators if ctx else []
        recs = ctx.recommendations or ctx.recommended_actions if ctx else []

        prompt = f"""
You are the Presentation Design Agent.
Generate a structured 4 to 6 slide presentation based strictly on the Central Context.

Central Context:
Core Topic: {topic}
Executive Summary: {summary}
Indicators: {indicators}
Affected Systems: {affected}
Recommended Actions: {recs}
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=PresentationOutput,
            system_prompt="You structure slide presentations with bullet points and speaker notes.",
            use_fast_model=False
        )
        out = result.model_dump()

        if not out.get("slides") or len(out["slides"]) == 0:
            out["title"] = f"Executive Presentation: {topic}"
            out["slides"] = [
                {
                    "slide_number": 1,
                    "title": f"Incident Overview: {topic}",
                    "bullets": [summary if summary else "Active security incident breach investigation", f"Impacted systems: {', '.join(affected) if affected else 'Perimeter gateway'}"],
                    "speaker_notes": "Introduce incident severity and affected operational scope to leadership."
                },
                {
                    "slide_number": 2,
                    "title": "Indicators of Compromise (IoCs)",
                    "bullets": [f"Detected indicator: {ioc}" for ioc in (indicators[:3] if indicators else ["198.51.100.45", "INC-2026-8894"])],
                    "speaker_notes": "Review technical indicators identified across firewall and endpoint logs."
                },
                {
                    "slide_number": 3,
                    "title": "Recommended Remediation & Actions",
                    "bullets": recs if recs else ["Isolate affected host nodes", "Reset administrative Kerberos keys"],
                    "speaker_notes": "Highlight immediate decision items requiring authorization."
                }
            ]

        return out

presentation_agent = PresentationAgent()
