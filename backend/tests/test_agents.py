from app.agents.state import TransformationState
from app.agents.context_agent import context_agent
from app.agents.executive_agent import executive_agent
from app.agents.advisory_agent import advisory_agent
from app.agents.social_agent import social_agent
from app.agents.compliance_agent import compliance_agent

def test_context_and_downstream_agents():
    state = TransformationState(
        transformation_id="trans_test_1",
        project_id="proj_test_1",
        source_texts=["Critical zero-day vulnerability in Gateway Firewall allowing Remote Code Execution (RCE). CVE-2026-1001."],
        target_audience="executive",
        tone="formal",
        urgency_level="critical",
        language="English",
        output_formats=["executive_brief", "advisory", "social"]
    )

    # 1. Run Context Agent
    ctx = context_agent.run(state)
    state.central_context = ctx
    assert ctx.urgency_level in ["critical", "high"]
    assert ctx.core_topic != ""

    # 2. Run Executive Agent
    exec_brief = executive_agent.run(state)
    state.executive_brief = exec_brief
    assert "executive_summary" in exec_brief
    assert "business_impact" in exec_brief

    # 3. Run Advisory Agent
    advisory = advisory_agent.run(state)
    state.advisory = advisory
    assert "threat_overview" in advisory
    assert "affected_systems" in advisory

    # 4. Run Social Agent
    social = social_agent.run(state)
    state.social = social
    assert "linkedin" in social
    assert "twitter" in social

    # 5. Run Compliance Agent
    comp = compliance_agent.run(state)
    assert comp["status"] in ["passed", "warning"]
