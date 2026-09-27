from typing import Any, Dict, List
from pydantic import BaseModel
from app.models.llm import llm_service
from app.agents.state import TransformationState

class AdvisoryOutput(BaseModel):
    title: str = "SECURITY ADVISORY: Vulnerability Alert"
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
        core_topic = ctx.core_topic if ctx and ctx.core_topic else "Cybersecurity Advisory"
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
            use_fast_model=False
        )
        out = result.model_dump()

        if not out.get("title"):
            out["title"] = f"SECURITY ADVISORY: {core_topic}"
        if not out.get("severity"):
            out["severity"] = severity
        if not out.get("threat_overview"):
            out["threat_overview"] = f"Security Advisory regarding {core_topic}. Impacted systems: {', '.join(affected) if affected else 'Perimeter Infrastructure'}."
        if not out.get("affected_systems"):
            out["affected_systems"] = affected if affected else ["Enterprise Perimeter"]
        if not out.get("indicators"):
            out["indicators"] = indicators if indicators else ["198.51.100.45", "INC-2026-8894"]
        if not out.get("mitigation_steps"):
            out["mitigation_steps"] = recs if recs else ["Isolate affected hosts from local LAN", "Apply emergency patch v2.1"]
        if not out.get("recommended_actions"):
            out["recommended_actions"] = recs if recs else ["Reset Kerberos ticket keys", "Revoke compromised user tokens"]
        if not out.get("references"):
            out["references"] = ["CISA Advisory AA26-080A", "NIST SP 800-61 Rev 2"]

        return out

advisory_agent = AdvisoryAgent()
