from typing import Any, Dict, List
from pydantic import BaseModel
from app.models.llm import llm_service
from app.agents.state import TransformationState

class ExecutiveBriefOutput(BaseModel):
    title: str = "Executive Briefing Report"
    executive_summary: str = ""
    business_impact: str = ""
    operational_risk: str = ""
    immediate_decisions: List[str] = []
    recommended_actions: List[str] = []

class ExecutiveAgent:
    def run(self, state: TransformationState) -> Dict[str, Any]:
        ctx = state.central_context
        
        core_topic = ctx.core_topic if ctx and ctx.core_topic else "Executive Briefing"
        intent = ctx.detected_intent if ctx and ctx.detected_intent else "general_report"
        severity = ctx.severity if ctx and ctx.severity else ctx.urgency_level.upper() if ctx else "HIGH"
        facts = ctx.key_facts or ctx.key_findings if ctx else []
        indicators = ctx.threat_indicators if ctx else []
        affected = ctx.affected_systems if ctx else []
        timeline = ctx.timeline if ctx else []
        recommendations = ctx.recommendations or ctx.recommended_actions if ctx else []
        exec_summary_ctx = ctx.executive_summary if ctx else ""

        prompt = f"""
You are the Senior Executive Briefing & Strategy Analyst for Nexora AI.
Generate a high-level, authoritative Strategic Executive Briefing based strictly on the Central Context below.

Context:
Core Topic: {core_topic}
Domain / Intent: {intent}
Assessed Urgency / Severity: {severity}
Context Overview: {exec_summary_ctx}
Key Findings: {facts}
Key Indicators / Scope: {indicators}
Affected Areas / Units: {affected}
Timeline / Milestones: {timeline}
Recommended Actions: {recommendations}

Transformation Requirements:
- Target Audience: {state.target_audience} (Executive Leadership, Board of Directors, Senior Management)
- Tone: {state.tone} (Authoritative, Strategic, Objective)
- Language: {state.language}

REQUIRED FIELDS:
1. title: Polished, professional executive title reflecting the core topic (e.g. "Strategic Executive Briefing: {core_topic}")
2. executive_summary: A comprehensive C-Suite Strategic Memo (2-3 concise paragraphs). 
   CRITICAL REQUIREMENT: Do NOT simply repeat the input summary word-for-word. Synthesize an elevated executive narrative articulating:
   - Paragraph 1: Strategic Situation & Operational Context (what has transpired, core scope, and current status).
   - Paragraph 2: Organizational Stakes & Operational Impact (the broader implications on operations, stakeholders, and organizational continuity).
   - Paragraph 3: Executive Governance Mandate (immediate strategic priorities and required leadership oversight).
3. business_impact: Rigorous operational, continuity, financial, and reputational impact analysis.
4. operational_risk: Critical risk exposure analysis, risk velocity, and potential cascading operational bottlenecks.
5. immediate_decisions: Array of 3-4 specific governance decisions requiring executive authorization or sign-off.
6. recommended_actions: Array of 3-5 prioritized strategic and operational remediation steps.
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=ExecutiveBriefOutput,
            system_prompt="You write concise, high-impact executive strategic briefings for CEOs, Executive Boards, and senior leadership.",
            use_fast_model=True
        )

        output_dict = result.model_dump()

        if not output_dict.get("title"):
            output_dict["title"] = f"Executive Strategic Briefing: {core_topic}"

        # Ensure executive summary is a well-crafted strategic memo and not just an empty string or raw 1-liner
        exec_sum = output_dict.get("executive_summary", "").strip()
        if not exec_sum or exec_sum == exec_summary_ctx:
            affected_str = ", ".join(affected[:3]) if affected else "core operational functional units"
            recs_str = recommendations[0] if recommendations else "active mitigation workflows"
            output_dict["executive_summary"] = (
                f"Strategic Situation & Scope: This executive briefing provides operational synthesis regarding {core_topic} (Priority: {severity}). "
                f"Evaluation indicates direct engagement across {affected_str}.\n\n"
                f"Organizational Stakes: Operational continuity and resource allocation remain under active monitoring. "
                f"Cross-functional response teams have mobilized standard operating procedures to maintain situational control and mitigate secondary exposures.\n\n"
                f"Executive Mandate: Senior leadership direction is focused on authorizing immediate intervention: {recs_str}, "
                f"ensuring transparent stakeholder communications, and verifying operational recovery thresholds."
            )

        if not output_dict.get("business_impact"):
            output_dict["business_impact"] = (
                ctx.business_impact if ctx and ctx.business_impact else
                f"Operational impact observed across {', '.join(affected) if affected else 'designated functional areas'}; resource allocation and active monitoring required to prevent secondary disruption."
            )

        if not output_dict.get("operational_risk"):
            output_dict["operational_risk"] = (
                ctx.operational_risk if ctx and ctx.operational_risk else
                f"Operational exposure in {', '.join(affected[:2]) if affected else 'primary operational sectors'}; adherence to standardized protocols is essential to eliminate cascading risks."
            )

        if not output_dict.get("immediate_decisions"):
            output_dict["immediate_decisions"] = [
                f"Authorize resource allocation: {r}" for r in recommendations[:3]
            ] if recommendations else [
                f"Authorize priority resource allocation for {core_topic}",
                "Approve coordinated stakeholder communication protocol",
                "Mandate daily operational milestone reviews until stabilization"
            ]

        if not output_dict.get("recommended_actions"):
            output_dict["recommended_actions"] = recommendations if recommendations else [
                f"Deploy operational response teams across {core_topic} functional areas",
                "Establish real-time monitoring dashboard for key performance indicators",
                "Execute post-incident evaluation and operational resilience review"
            ]

        return output_dict

executive_agent = ExecutiveAgent()
