from typing import Any, Dict, List
from pydantic import BaseModel, Field
from app.models.llm import llm_service
from app.agents.state import TransformationState

class SocialPlatformContent(BaseModel):
    platform: str = "linkedin"
    content: str = ""
    character_count: int = 0
    hashtags: List[str] = Field(default_factory=list)
    references: List[str] = Field(default_factory=list)

class SocialOutput(BaseModel):
    linkedin: SocialPlatformContent = Field(default_factory=SocialPlatformContent)
    twitter: SocialPlatformContent = Field(default_factory=lambda: SocialPlatformContent(platform="twitter"))

class SocialAgent:
    def run(self, state: TransformationState) -> Dict[str, Any]:
        ctx = state.central_context
        topic = ctx.core_topic if ctx and ctx.core_topic else "Cybersecurity Alert"
        summary = ctx.executive_summary if ctx and ctx.executive_summary else "Security breach incident under investigation."
        severity = ctx.severity if ctx and ctx.severity else ctx.urgency_level.upper() if ctx else "HIGH"

        prompt = f"""
You are the Cybersecurity Social Content Specialist.
Generate audience-tailored social media communications based on the Central Context.

Central Context:
Core Topic: {topic}
Executive Summary: {summary}
Severity: {severity}

Generate:
1. LinkedIn Post: Engaging, professional cybersecurity post formatted with clear sections and linebreaks (Under 3000 chars).
2. Twitter/X Thread: Concise, impact-driven thread (Under 280 characters).
Include relevant hashtags (e.g., #CyberSecurity #InfoSec #ThreatIntel).
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=SocialOutput,
            system_prompt="You create viral, high-authority cybersecurity posts for social media.",
            use_fast_model=False
        )
        out = result.model_dump()

        if not out.get("linkedin") or not out["linkedin"].get("content"):
            li_text = f"🚨 CYBER THREAT ALERT: {topic}\n\nAnalyst Summary:\n{summary}\n\nUrgency Level: {severity}\n\nRecommended Action: Apply defensive mitigations immediately."
            out["linkedin"] = {
                "platform": "linkedin",
                "content": li_text,
                "character_count": len(li_text),
                "hashtags": ["#CyberSecurity", "#InfoSec", "#ThreatIntel"],
                "references": []
            }

        if not out.get("twitter") or not out["twitter"].get("content"):
            tw_text = f"⚠️ THREAT ALERT: {topic}. Severity: {severity}. {summary[:120]} #CyberSecurity #InfoSec"
            out["twitter"] = {
                "platform": "twitter",
                "content": tw_text,
                "character_count": len(tw_text),
                "hashtags": ["#CyberSecurity", "#InfoSec"],
                "references": []
            }

        return out

social_agent = SocialAgent()
