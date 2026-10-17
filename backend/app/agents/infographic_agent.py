from typing import Any, Dict, List
from pydantic import BaseModel, Field
from app.models.llm import llm_service
from app.agents.state import TransformationState

class InfographicMetric(BaseModel):
    label: str = "Metric"
    value: str = "100%"
    description: str = "Description"

class InfographicOutput(BaseModel):
    title: str = "Executive Intelligence Infographic Data"
    severity: str = "HIGH"
    core_topic: str = ""
    impact_summary: str = ""
    metrics: List[InfographicMetric] = Field(default_factory=list)
    timeline: List[str] = Field(default_factory=list)
    threat_flow: List[str] = Field(default_factory=list)
    affected_systems: List[str] = Field(default_factory=list)
    indicators: List[str] = Field(default_factory=list)
    mitigation_flow: List[str] = Field(default_factory=list)

class InfographicAgent:
    def run(self, state: TransformationState) -> Dict[str, Any]:
        ctx = state.central_context
        topic = ctx.core_topic if ctx and ctx.core_topic else "Operational Analysis Infographic"
        severity = ctx.severity if ctx and ctx.severity else ctx.urgency_level.upper() if ctx else "HIGH"
        affected = ctx.affected_systems if ctx else []
        indicators = ctx.threat_indicators if ctx else []
        recs = ctx.recommendations or ctx.recommended_actions if ctx else []

        prompt = f"""
You are the Infographic Data Visualizer Agent.
Extract visual data structures for rendering an interactive Infographic from Central Context.

Central Context:
Core Topic: {topic}
Severity: {severity}
Executive Summary: {ctx.executive_summary if ctx else ''}
Threat Indicators: {indicators}
Affected Systems: {affected}
Timeline: {ctx.timeline if ctx else []}
Recommended Actions: {recs}
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=InfographicOutput,
            system_prompt="You create structured data objects for frontend charts and vector infographics.",
            use_fast_model=True
        )
        out = result.model_dump()

        if not out.get("core_topic"):
            out["core_topic"] = topic
        if not out.get("impact_summary"):
            out["impact_summary"] = f"Visual operational analysis for {topic} affecting {', '.join(affected) if affected else 'operational zones'}."
        if not out.get("metrics") or len(out["metrics"]) == 0:
            out["metrics"] = [
                {"label": "Urgency Level", "value": severity, "description": "Assessed incident risk level"},
                {"label": "Affected Sectors", "value": str(len(affected)) if affected else "Multiple", "description": "Identified impacted locations"},
                {"label": "Response Actions", "value": str(len(recs)) if recs else "Active", "description": "Remediation and relief measures"}
            ]
        if not out.get("indicators"):
            out["indicators"] = indicators if indicators else (affected if affected else ["Primary Operational Sector"])
        if not out.get("affected_systems"):
            out["affected_systems"] = affected if affected else [f"{topic} Operational Scope"]
        if not out.get("mitigation_flow"):
            out["mitigation_flow"] = recs if recs else ["Deploy Operational Teams", "Initiate Core Remediation", "Conduct Final Review"]

        return out

infographic_agent = InfographicAgent()
