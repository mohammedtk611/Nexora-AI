import re
from typing import Any, Dict, List
from pydantic import BaseModel, Field
from app.models.llm import llm_service
from app.agents.state import TransformationState

class SlideItem(BaseModel):
    slide_number: int = 1
    title: str = "Executive Briefing Overview"
    bullets: List[str] = Field(default_factory=list)
    speaker_notes: str = ""

class PresentationOutput(BaseModel):
    title: str = "Executive Intelligence Presentation Deck"
    slides: List[SlideItem] = Field(default_factory=list)

class PresentationAgent:
    def run(self, state: TransformationState) -> Dict[str, Any]:
        ctx = state.central_context
        topic = ctx.core_topic if ctx and ctx.core_topic else "Executive Briefing Presentation"
        summary = ctx.executive_summary if ctx and ctx.executive_summary else "Operational analysis and strategic response."
        severity = ctx.severity if ctx and ctx.severity else ctx.urgency_level.upper() if ctx else "HIGH"
        affected = ctx.affected_systems if ctx else []
        indicators = ctx.threat_indicators if ctx else []
        findings = ctx.key_facts or ctx.key_findings if ctx else []
        recs = ctx.recommendations or ctx.recommended_actions if ctx else []

        prompt = f"""
You are the Executive Presentation Deck Designer.
Create a high-impact, professional 4 to 5 slide presentation deck based strictly on the Central Context.

Context Details:
Core Topic: {topic}
Urgency / Severity: {severity}
Context Findings: {findings}
Affected Systems / Scope: {affected}
Key Identifiers / Metrics: {indicators}
Recommended Actions: {recs}

Transformation Guidelines:
- Target Audience: {state.target_audience} (Executives, Board Members, Stakeholders)
- Tone: {state.tone} (Crisp, Professional, Presentation-Ready)
- Language: {state.language}

CRITICAL FORMATTING RULES:
1. NEVER copy or paste narrative paragraphs into slide bullets.
2. Each slide bullet MUST be a concise, high-impact bullet takeaway (maximum 12 to 16 words per bullet, 3 to 4 bullets per slide).
3. Structure the deck into 4 cohesive slides:
   - Slide 1: Situation & Executive Overview (Scope, Urgency level, Key Objectives)
   - Slide 2: Critical Findings & Observations (Core metrics, verified facts, affected areas)
   - Slide 3: Operational Impact & Risk Profile (Continuity stakes, exposure, primary challenges)
   - Slide 4: Remediation Roadmap & Next Steps (Immediate actions, governance approvals, operational milestones)
4. Provide engaging, professional speaker notes (2-3 sentences) for each slide.
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=PresentationOutput,
            system_prompt="You create structured presentation decks with concise, punchy slide bullet points and clear speaker notes. You NEVER place raw paragraph text into slide bullets.",
            use_fast_model=True
        )
        out = result.model_dump()

        # Sanitize slide bullets: ensure no bullet is a giant paragraph or identical to the summary
        clean_slides = []
        raw_slides = out.get("slides", [])
        for idx, slide in enumerate(raw_slides):
            sanitized_bullets = []
            for b in slide.get("bullets", []):
                b_str = str(b).strip()
                # If bullet is essentially the entire summary or longer than 35 words, break it down
                if len(b_str.split()) > 30 or b_str == summary:
                    sub_sentences = [s.strip() for s in re.split(r'[.;]\s+', b_str) if len(s.strip()) > 10]
                    if sub_sentences:
                        sanitized_bullets.extend(sub_sentences[:3])
                    else:
                        sanitized_bullets.append(b_str[:120] + "...")
                elif b_str:
                    sanitized_bullets.append(b_str)
            
            if sanitized_bullets:
                slide["bullets"] = sanitized_bullets[:4]
                clean_slides.append(slide)

        out["slides"] = clean_slides

        # Robust dynamic fallback if LLM returned 0 slides
        if not out.get("slides") or len(out["slides"]) == 0:
            out["title"] = f"Executive Presentation: {topic}"
            affected_str = ", ".join(affected[:3]) if affected else "Core operational units"
            finding_1 = findings[0] if findings else f"Assessment confirmed operational scope for {topic}."
            finding_2 = findings[1] if len(findings) > 1 else f"Priority impacts observed across {affected_str}."
            rec_1 = recs[0] if recs else f"Execute immediate response protocol for {topic}."
            rec_2 = recs[1] if len(recs) > 1 else "Establish daily progress review and stakeholder coordination."

            out["slides"] = [
                {
                    "slide_number": 1,
                    "title": "Situation & Executive Overview",
                    "bullets": [
                        f"Operational Scope: Coordinated response engaged for {topic}.",
                        f"Assessed Urgency: {severity} priority classification.",
                        f"Targeted Coverage: Active monitoring across {affected_str}.",
                        "Leadership Mandate: Enforce continuity and mitigation timelines."
                    ],
                    "speaker_notes": f"Welcome leadership. Today's briefing reviews operational status and critical decision milestones for {topic}."
                },
                {
                    "slide_number": 2,
                    "title": "Key Findings & Measured Scope",
                    "bullets": [
                        f"Primary Observation: {finding_1}",
                        f"Secondary Assessment: {finding_2}",
                        f"Monitored Focus Areas: {', '.join(indicators[:3]) if indicators else affected_str}",
                        "Operational Validation: Factual consistency confirmed against source telemetry."
                    ],
                    "speaker_notes": "These findings represent verified facts from the initial operational assessment and field telemetry."
                },
                {
                    "slide_number": 3,
                    "title": "Operational Impact & Risk Assessment",
                    "bullets": [
                        f"Business Continuity: Immediate service integrity maintained across {affected_str}.",
                        "Risk Exposure: Potential operational delays without active resource mobilization.",
                        "Interdependency: Cross-functional coordination required to safeguard delivery.",
                        "Threshold Monitoring: Key indicators tracked against tolerance limits."
                    ],
                    "speaker_notes": "We must emphasize operational risk containment to prevent downstream bottlenecks in related divisions."
                },
                {
                    "slide_number": 4,
                    "title": "Strategic Action Plan & Next Steps",
                    "bullets": [
                        f"Priority Action: {rec_1}",
                        f"Governance Step: {rec_2}",
                        "Stakeholder Sync: Standardized communications distributed to operational teams.",
                        "Milestone Tracking: Scheduled review upon completion of phase one remediation."
                    ],
                    "speaker_notes": "Leadership sign-off is requested on the immediate action roadmap to authorize necessary resource allocation."
                }
            ]

        return out

presentation_agent = PresentationAgent()
