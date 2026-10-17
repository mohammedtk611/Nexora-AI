from typing import Any, Dict, List
from pydantic import BaseModel
from app.models.llm import llm_service
from app.agents.state import TransformationState

class ExecutiveBriefOutput(BaseModel):
    title: str = "Executive Brief: Cybersecurity Intelligence Report"
    executive_summary: str = ""
    business_impact: str = ""
    operational_risk: str = ""
    immediate_decisions: List[str] = []
    recommended_actions: List[str] = []

class ExecutiveAgent:
    def run(self, state: TransformationState) -> Dict[str, Any]:
        ctx = state.central_context
        
        # Gather all context details
        core_topic = ctx.core_topic if ctx and ctx.core_topic else "Cybersecurity Threat Incident"
        intent = ctx.detected_intent if ctx and ctx.detected_intent else "incident_report"
        severity = ctx.severity if ctx and ctx.severity else ctx.urgency_level.upper() if ctx else "HIGH"
        facts = ctx.key_facts or ctx.key_findings if ctx else []
        indicators = ctx.threat_indicators if ctx else []
        affected = ctx.affected_systems if ctx else []
        timeline = ctx.timeline if ctx else []
        recommendations = ctx.recommendations or ctx.recommended_actions if ctx else []
        exec_summary_ctx = ctx.executive_summary if ctx else ""

        prompt = f"""
You are the Senior Executive Communication Agent for Nexora AI.
Generate a high-level, authoritative Executive Briefing Report based strictly on the Central Context below.

Central Context:
Core Topic: {core_topic}
Intent Type: {intent}
Severity: {severity}
Executive Summary Context: {exec_summary_ctx}
Key Factual Claims: {facts}
Indicators of Compromise: {indicators}
Affected Infrastructure: {affected}
Incident Timeline: {timeline}
Recommended Actions: {recommendations}

User Transformation Requirements:
- Target Audience: {state.target_audience}
- Tone: {state.tone}
- Language: {state.language}

REQUIRED FIELDS (Do not leave any field empty):
1. title: Professional title for CISO / Board briefing
2. executive_summary: High-level executive summary summarizing breach scope and status
3. business_impact: Business continuity, financial, and operational impact analysis
4. operational_risk: Enterprise risk exposure, system compromise, or data privacy risk
5. immediate_decisions: Array of strategic decision items requiring executive approval
6. recommended_actions: Array of technical & operational remediation steps
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=ExecutiveBriefOutput,
            system_prompt="You produce executive leadership briefs for CISOs and enterprise CEOs.",
            use_fast_model=True
        )

        output_dict = result.model_dump()

        # Enforce non-empty fields derived from ICO if LLM returned empty strings
        if not output_dict.get("title"):
            output_dict["title"] = f"Executive Brief: {core_topic}"

        if not output_dict.get("executive_summary"):
            output_dict["executive_summary"] = (
                exec_summary_ctx or
                f"A {severity} urgency incident ({core_topic}) was identified. "
                f"Impacted areas and systems: {', '.join(affected) if affected else 'operational zones'}. "
                f"Incident response protocols are active to contain the situation."
            )

        if not output_dict.get("business_impact"):
            output_dict["business_impact"] = (
                ctx.business_impact if ctx and ctx.business_impact else
                f"Operational impact observed across {', '.join(affected) if affected else 'monitored sectors'}."
            )

        if not output_dict.get("operational_risk"):
            output_dict["operational_risk"] = (
                ctx.operational_risk if ctx and ctx.operational_risk else
                f"Operational and safety risks identified in {', '.join(affected[:2]) if affected else 'affected areas'}; active mitigations required."
            )

        if not output_dict.get("immediate_decisions"):
            output_dict["immediate_decisions"] = [
                f"Approve emergency resource deployment: {r}" for r in recommendations[:3]
            ] if recommendations else [
                "Authorize emergency operational response",
                "Deploy priority resources to affected zones",
                "Establish unified public communications channel"
            ]

        if not output_dict.get("recommended_actions"):
            output_dict["recommended_actions"] = recommendations if recommendations else [
                "Deploy emergency pumping and field response teams",
                "Activate temporary relief accommodation for relocated residents",
                "Conduct infrastructure and drainage assessment"
            ]

        return output_dict

executive_agent = ExecutiveAgent()
