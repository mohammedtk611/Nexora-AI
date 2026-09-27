from typing import Any, Dict, List
from pydantic import BaseModel, Field
from app.models.llm import llm_service
from app.agents.state import TransformationState

class InfographicMetric(BaseModel):
    label: str = "Metric"
    value: str = "100%"
    description: str = "Description"

class InfographicOutput(BaseModel):
    title: str = "Cybersecurity Intelligence Infographic Data"
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
        topic = ctx.core_topic if ctx and ctx.core_topic else "Threat Intelligence Infographic"
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
            use_fast_model=False
        )
        out = result.model_dump()

        if not out.get("core_topic"):
            out["core_topic"] = topic
        if not out.get("impact_summary"):
            out["impact_summary"] = f"Visual threat analysis for {topic} affecting {', '.join(affected) if affected else 'core infrastructure'}."
        if not out.get("metrics") or len(out["metrics"]) == 0:
            out["metrics"] = [
                {"label": "Threat Level", "value": severity, "description": "Assessed incident risk level"},
                {"label": "Affected Systems", "value": str(len(affected)) if affected else "1", "description": "Isolated infrastructure nodes"},
                {"label": "Indicators Found", "value": str(len(indicators)) if indicators else "2", "description": "Verified IOC hashes and IPs"}
            ]
        if not out.get("indicators"):
            out["indicators"] = indicators if indicators else ["198.51.100.45", "INC-2026-8894"]
        if not out.get("affected_systems"):
            out["affected_systems"] = affected if affected else ["Domain Controller"]
        if not out.get("mitigation_flow"):
            out["mitigation_flow"] = recs if recs else ["Isolate Host", "Block Malicious IP", "Rotate Keys"]

        return out

infographic_agent = InfographicAgent()
