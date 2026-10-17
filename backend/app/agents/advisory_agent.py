from typing import Any, Dict, List
from pydantic import BaseModel
from app.models.llm import llm_service
from app.agents.state import TransformationState

class AdvisoryOutput(BaseModel):
    title: str = "INCIDENT ADVISORY"
    severity: str = "HIGH"
    target_audience: str = "Technical"
    threat_overview: str = ""
    affected_systems: List[str] = []
    indicators: List[str] = []
    mitigation_steps: List[str] = []
    recommended_actions: List[str] = []
    references: List[str] = []

class AdvisoryAgent:
    def run(self, state: TransformationState) -> Dict[str, Any]:
        ctx = state.central_context
        core_topic = ctx.core_topic if ctx and ctx.core_topic else "Incident Advisory"
        severity = ctx.severity if ctx and ctx.severity else ctx.urgency_level.upper() if ctx else "HIGH"
        affected = ctx.affected_systems if ctx else []
        indicators = ctx.threat_indicators if ctx else []
        recs = ctx.recommendations or ctx.recommended_actions if ctx else []

        prompt = f"""
You are the Technical Security Advisory Agent.
Generate a technical Security Advisory strictly adhering to the Central Context.

Central Context:
Core Topic: {core_topic}
Severity: {severity}
Affected Systems: {affected}
Indicators: {indicators}
Technical Details: {ctx.technical_details if ctx else []}
Recommended Actions: {recs}

User Parameters:
- Target Audience: {state.target_audience}
- Tone: {state.tone}
- Language: {state.language}
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=AdvisoryOutput,
            system_prompt="You produce technical security advisories for SecOps and SOC teams.",
            use_fast_model=True
        )
        out = result.model_dump()

        if not out.get("title"):
            out["title"] = f"INCIDENT ADVISORY: {core_topic}"
        if not out.get("severity"):
            out["severity"] = severity
        if not out.get("threat_overview"):
            out["threat_overview"] = (
                ctx.executive_summary if ctx and ctx.executive_summary else
                f"Incident Advisory regarding {core_topic}. Impacted areas and infrastructure: {', '.join(affected) if affected else 'Monitored sectors'}."
            )
        if not out.get("affected_systems"):
            out["affected_systems"] = affected if affected else ["Operational Infrastructure"]
        if not out.get("indicators"):
            out["indicators"] = indicators if indicators else (affected if affected else ["Monitored Incident Sectors"])
        if not out.get("mitigation_steps"):
            out["mitigation_steps"] = recs if recs else ["Deploy emergency response personnel", "Activate temporary municipal shelters"]
        if not out.get("recommended_actions"):
            out["recommended_actions"] = recs if recs else ["Clear blocked drainage inlets", "Establish priority emergency traffic corridors"]
        if not out.get("references"):
            out["references"] = [f"{core_topic} - Situation Report", "Standard Operating Emergency Protocol"]

        return out

advisory_agent = AdvisoryAgent()
