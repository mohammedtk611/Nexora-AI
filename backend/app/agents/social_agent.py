import re
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
        topic = ctx.core_topic if ctx and ctx.core_topic else "Operational Update"
        summary = ctx.executive_summary if ctx and ctx.executive_summary else "Status report and operational update."
        severity = ctx.severity if ctx and ctx.severity else ctx.urgency_level.upper() if ctx else "HIGH"

        prompt = f"""
You are the Strategic Communications & Social Media Specialist for Nexora AI.
Generate audience-tailored, professional social media communications grounded strictly in the Central Context.

Central Context:
Core Topic: {topic}
Executive Summary: {summary}
Assessed Urgency: {severity}

Deliverables:
1. LinkedIn Post: Engaging, high-credibility professional post with structured sections, clear key takeaways, and relevant contextual hashtags (Under 2500 chars).
2. X / Twitter Post: Punchy, urgent, informative broadcast under 280 characters with 2-3 relevant topic-specific hashtags.
CRITICAL: Only use hashtags directly relevant to {topic}. Do NOT use unrelated hashtags.
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=SocialOutput,
            system_prompt="You create professional, high-authority social media communications accurately tailored to the specific domain of the report.",
            use_fast_model=True
        )
        out = result.model_dump()

        # Generate topic-derived dynamic hashtags
        words = re.findall(r'[A-Za-z0-9]+', topic)
        dynamic_tags = [f"#{w.capitalize()}" for w in words if len(w) > 3][:3]
        if not dynamic_tags:
            dynamic_tags = ["#OperationalUpdate", "#LeadershipBrief"]

        if not out.get("linkedin") or not out["linkedin"].get("content"):
            li_tags = dynamic_tags + ["#OperationalUpdate", "#IndustryInsights"]
            li_text = (
                f"📢 OFFICIAL UPDATE: {topic}\n\n"
                f"Summary Overview:\n{summary}\n\n"
                f"Priority Classification: {severity}\n\n"
                f"Key Takeaways:\n"
                f"• Active response and mitigation measures are underway.\n"
                f"• Cross-functional teams are coordinating to ensure continuity.\n"
                f"• Verified updates will continue to be shared through authorized channels.\n\n"
                f"{' '.join(li_tags)}"
            )
            out["linkedin"] = {
                "platform": "linkedin",
                "content": li_text,
                "character_count": len(li_text),
                "hashtags": li_tags,
                "references": []
            }

        if not out.get("twitter") or not out["twitter"].get("content"):
            tags_str = " ".join(dynamic_tags)
            tw_summary = summary[:130] if summary else "Active monitoring and response measures underway."
            tw_text = f"UPDATE: {topic} | Status: {severity}\n\n{tw_summary}\n\n{tags_str}"
            out["twitter"] = {
                "platform": "twitter",
                "content": tw_text,
                "character_count": len(tw_text),
                "hashtags": dynamic_tags,
                "references": []
            }

        return out

social_agent = SocialAgent()
