from typing import Any, Dict, List
from pydantic import BaseModel
from app.models.llm import llm_service
from app.agents.state import TransformationState

class AdvisoryOutput(BaseModel):
    title: str = "OPERATIONAL & TECHNICAL ADVISORY"
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
        core_topic = ctx.core_topic if ctx and ctx.core_topic else "Technical Advisory"
        severity = ctx.severity if ctx and ctx.severity else ctx.urgency_level.upper() if ctx else "HIGH"
        affected = ctx.affected_systems if ctx else []
        indicators = ctx.threat_indicators if ctx else []
        recs = ctx.recommendations or ctx.recommended_actions if ctx else []

        prompt = f"""
You are the Technical & Operational Advisory Agent for Nexora AI.
Generate an authoritative Technical & Operational Advisory strictly adhering to the Central Context below.

Central Context:
Core Topic: {core_topic}
Assessed Severity / Urgency: {severity}
Affected Systems / Areas: {affected}
Key Indicators / Reference Codes: {indicators}
Technical & Factual Details: {ctx.key_findings if ctx else []}
Recommended Remediation Actions: {recs}

Parameters:
- Target Audience: {state.target_audience} (Engineers, Operators, Technical Analysts)
- Tone: {state.tone} (Precise, Action-Oriented, Technical)
- Language: {state.language}

REQUIRED FIELDS:
1. title: Authoritative advisory title (e.g. "OPERATIONAL ADVISORY: {core_topic}")
2. severity: {severity}
3. target_audience: Technical & Operations Teams
4. threat_overview: Detailed technical breakdown of the condition, affected components, and root assessment.
5. affected_systems: Specific infrastructure, services, units, or sectors affected.
6. indicators: Technical identifiers, tracking codes, metrics, or observation points.
7. mitigation_steps: Array of 3-4 immediate containment or tactical mitigation procedures.
8. recommended_actions: Array of 3-4 structured resolution or operational follow-up steps.
9. references: Standard operating procedures or relevant internal documentation titles.
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=AdvisoryOutput,
            system_prompt="You produce precise, authoritative technical and operational advisories with strict factual grounding.",
            use_fast_model=True
        )
        out = result.model_dump()

        if not out.get("title"):
            out["title"] = f"OPERATIONAL ADVISORY: {core_topic}"
        if not out.get("severity"):
            out["severity"] = severity
        if not out.get("threat_overview"):
            out["threat_overview"] = (
                ctx.executive_summary if ctx and ctx.executive_summary else
                f"Operational Advisory regarding {core_topic}. Impacted infrastructure and functional areas: {', '.join(affected) if affected else 'Designated operational sectors'}."
            )
        if not out.get("affected_systems"):
            out["affected_systems"] = affected if affected else [f"{core_topic} Operational Domain"]
        if not out.get("indicators"):
            out["indicators"] = indicators if indicators else (affected if affected else [f"{core_topic} Telemetry"])
        if not out.get("mitigation_steps"):
            out["mitigation_steps"] = recs[:3] if recs else [
                f"Initiate tactical containment protocol for {core_topic}",
                "Isolate affected operational pathways and verify system integrity",
                "Deploy specialized technical teams for real-time diagnostics"
            ]
        if not out.get("recommended_actions"):
            out["recommended_actions"] = recs if recs else [
                f"Verify operational thresholds and restore baseline service for {core_topic}",
                "Perform cross-system verification and logging review",
                "Document technical resolution in the central registry"
            ]
        if not out.get("references"):
            out["references"] = [f"{core_topic} - Situation Report", "Standard Operating Procedure (SOP-01)"]

        return out

advisory_agent = AdvisoryAgent()
