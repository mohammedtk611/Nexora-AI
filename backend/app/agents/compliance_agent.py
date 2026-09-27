import json
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from app.models.llm import llm_service
from app.agents.state import TransformationState

class ComplianceCheckResult(BaseModel):
    status: str = "passed"  # passed, warning, failed
    warnings: List[str] = []
    issues: List[str] = []
    diagnostic_feedback: Optional[str] = None  # Instructions for agent auto-retry loop
    checks: Dict[str, bool] = {
        "source_grounding": True,
        "executive_brief_validation": True,
        "advisory_validation": True,
        "social_validation": True,
        "presentation_validation": True,
        "infographic_validation": True,
        "video_validation": True,
        "pii_detection": True,
        "severity_consistency": True
    }

class ComplianceAgent:
    def run(self, state: TransformationState) -> Dict[str, Any]:
        ico = state.central_context
        ico_dict = ico.model_dump() if ico else {}
        
        # Output deliverables summary
        artifacts_summary = {
            "executive_brief": state.executive_brief,
            "advisory": state.advisory,
            "social": state.social,
            "presentation": state.presentation,
            "infographic": state.infographic,
            "video_script": state.video_script
        }

        prompt = f"""
You are the Compliance, Security & Factual Consistency Validation Agent.
Audit the generated artifacts against the authoritative Intent Context Object (ICO).

Authoritative Approved ICO:
{json.dumps(ico_dict, indent=2)[:3000]}

Generated Artifacts Summary:
{json.dumps(artifacts_summary, indent=2)[:4000]}

Perform Output-Specific Validation Checks:
1. Executive Brief: Check that executive summary and recommended actions accurately match the ICO without hallucinations.
2. Security Advisory: Check that IoCs ({ico.threat_indicators if ico else []}) and CVEs match the ICO.
3. Social Content: Check LinkedIn (< 3000 chars) and X/Twitter thread (< 280 chars per post) character constraints.
4. Presentation Deck: Check slide titles and bullets align with ICO key findings.
5. Infographic: Check visual metrics and CVSS severity match the ICO urgency ({state.urgency_level}).
6. Video Package: Check narration timing and scene storyboards.
7. PII & Security: Verify no raw database credentials, system prompts, or unmasked secrets are exposed.

If any check fails, mark status as "failed" or "warning", list exact issues in the 'issues' list, and provide explicit correction instructions in 'diagnostic_feedback' for the agent auto-retry engine.

Output a valid ComplianceCheckResult JSON.
"""
        result = llm_service.generate_json(
            prompt=prompt,
            schema_class=ComplianceCheckResult,
            system_prompt="You perform rigorous security, privacy, and output-specific consistency guardrail validation.",
            use_fast_model=True
        )
        return result.model_dump()

compliance_agent = ComplianceAgent()

