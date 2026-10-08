import logging
import os
from typing import Any, Dict, Callable, List
from app.agents.state import TransformationState, AgentProgress
from app.agents.ingestion_agent import ingestion_agent
from app.agents.context_agent import context_agent
from app.agents.executive_agent import executive_agent
from app.agents.advisory_agent import advisory_agent
from app.agents.social_agent import social_agent
from app.agents.presentation_agent import presentation_agent
from app.agents.infographic_agent import infographic_agent
from app.agents.video_agent import video_agent
from app.agents.compliance_agent import compliance_agent

from app.rag.retriever import rag_retriever
from app.renderers.pdf_renderer import pdf_renderer
from app.renderers.pptx_renderer import pptx_renderer
from app.renderers.infographic_renderer import infographic_renderer
from app.renderers.audio_renderer import audio_renderer
from app.renderers.video_package_renderer import video_package_renderer
from app.storage.local_storage import storage_manager

logger = logging.getLogger("nexora_ai.graph")

MAX_VALIDATION_RETRIES = 2

class TransformationGraphRunner:
    def execute(self, state: TransformationState, progress_callback: Callable[[str, str, Dict[str, Any]], None] = None) -> TransformationState:
        def update_progress(agent_name: str, status: str, extra: Dict[str, Any] = None):
            state.current_stage = agent_name
            state.agent_progress[agent_name] = AgentProgress(name=agent_name, status=status)
            if progress_callback:
                progress_callback(agent_name, status, extra or {})

        try:
            # Stage 1: Ingestion Context
            update_progress("ingestion_agent", "running")
            ingestion_agent.run(state)
            update_progress("ingestion_agent", "completed")

            # Stage 2: Intent Detection & ICO Extraction
            update_progress("context_agent", "running")
            ico = context_agent.run(state)
            state.central_context = ico
            active_intent = ico.user_intent or ico.detected_intent or "security_alert"
            update_progress("context_agent", "completed", {
                "core_topic": ico.core_topic,
                "detected_intent": ico.detected_intent,
                "active_intent": active_intent,
                "provenance_count": len(ico.provenance),
                "conflicts_count": len(ico.conflicts)
            })

            # Stage 3: RAG Knowledge Base Enrichment
            update_progress("rag_retriever", "running")
            try:
                query = f"{ico.core_topic} {' '.join(ico.entities[:3])} {' '.join(ico.threat_indicators[:3])}"
                passages = rag_retriever.retrieve(query=query, top_k=3, project_id=state.project_id)
                state.rag_passages = passages
                if ico:
                    ico.retrieved_knowledge = passages
                update_progress("rag_retriever", "completed", {"retrieved_count": len(passages)})
            except Exception as rag_err:
                logger.warning(f"RAG lookup failed gracefully: {rag_err}")
                update_progress("rag_retriever", "completed", {"retrieved_count": 0})

            # Stage 4: Intelligent Agent Routing (Intent + Requested Formats)
            requested_formats = state.output_formats or ["executive_brief", "advisory", "social", "presentation", "infographic", "video"]
            
            # Intent-based agent routing map
            routed_formats = self._determine_agent_routes(active_intent, requested_formats)

            # Stage 5 & 6: Generation & Validation Auto-Retry Loop
            for attempt in range(MAX_VALIDATION_RETRIES + 1):
                attempt_label = f" (Retry {attempt})" if attempt > 0 else ""

                if "executive_brief" in routed_formats:
                    update_progress("executive_agent", f"running{attempt_label}")
                    state.executive_brief = executive_agent.run(state)
                    update_progress("executive_agent", "completed")

                if "advisory" in routed_formats:
                    update_progress("advisory_agent", f"running{attempt_label}")
                    state.advisory = advisory_agent.run(state)
                    update_progress("advisory_agent", "completed")

                if "social" in routed_formats:
                    update_progress("social_agent", f"running{attempt_label}")
                    state.social = social_agent.run(state)
                    update_progress("social_agent", "completed")

                if "presentation" in routed_formats:
                    update_progress("presentation_agent", f"running{attempt_label}")
                    state.presentation = presentation_agent.run(state)
                    update_progress("presentation_agent", "completed")

                if "infographic" in routed_formats:
                    update_progress("infographic_agent", f"running{attempt_label}")
                    state.infographic = infographic_agent.run(state)
                    update_progress("infographic_agent", "completed")

                if "video" in routed_formats or "video_script" in routed_formats:
                    update_progress("video_agent", f"running{attempt_label}")
                    state.video_script = video_agent.run(state)
                    update_progress("video_agent", "completed")

                # Compliance & Factual Consistency Validation Check
                update_progress("compliance_agent", f"running{attempt_label}")
                report = compliance_agent.run(state)
                state.compliance_report = report
                update_progress("compliance_agent", "completed", {"status": report.get("status")})

                if report.get("status") in ["passed", "warning"] or attempt == MAX_VALIDATION_RETRIES:
                    break
                else:
                    logger.warning(f"Validation failed on attempt {attempt + 1}. Diagnostic feedback: {report.get('diagnostic_feedback')}")

            # Stage 7: Rendering Artifact Files
            update_progress("rendering", "running")
            self._render_artifacts(state)
            update_progress("rendering", "completed")

            state.current_stage = "completed"
            return state

        except Exception as e:
            logger.error(f"Graph execution failed: {e}", exc_info=True)
            state.error = str(e)
            state.current_stage = "failed"
            return state

    def _determine_agent_routes(self, intent: str, requested_formats: List[str]) -> List[str]:
        # Intelligent routing maps cybersecurity intent to recommended formats
        intent_routes = {
            "incident_report": ["executive_brief", "advisory", "social", "presentation", "infographic", "video"],
            "vulnerability_advisory": ["advisory", "executive_brief", "presentation", "infographic"],
            "threat_intelligence": ["social", "executive_brief", "infographic", "presentation"],
            "malware_analysis": ["advisory", "infographic", "video"],
            "security_alert": ["advisory", "executive_brief", "social"],
            "risk_assessment": ["executive_brief", "presentation", "infographic"],
            "policy_update": ["executive_brief", "presentation"]
        }
        recommended = intent_routes.get(intent, ["executive_brief", "advisory", "social", "presentation", "infographic", "video"])
        # Intersection with user requested formats (ensure requested formats are honored)
        final_routes = list(set(recommended).intersection(set(requested_formats))) if requested_formats else recommended
        return final_routes if final_routes else requested_formats

    def _render_artifacts(self, state: TransformationState):
        prefix = f"trans_{state.transformation_id[:8]}"
        
        # Advisory PDF
        if state.advisory:
            pdf_path = storage_manager.get_path("pdf", f"{prefix}_advisory.pdf")
            rendered = pdf_renderer.render_advisory_pdf(state.advisory, pdf_path)
            state.rendered_files["advisory"] = rendered

        # Presentation PPTX
        if state.presentation:
            pptx_path = storage_manager.get_path("presentations", f"{prefix}_presentation.pptx")
            rendered = pptx_renderer.render_presentation(state.presentation.get("slides", []), pptx_path)
            state.rendered_files["presentation"] = rendered

        # Infographic SVG / Data
        if state.infographic:
            info_path = storage_manager.get_path("artifacts", f"{prefix}_infographic.json")
            res = infographic_renderer.render_infographic(state.infographic, info_path)
            state.rendered_files["infographic"] = res.get("svg_path", info_path)

        # Video Package ZIP
        if state.video_script:
            zip_path = storage_manager.get_path("video", f"{prefix}_video_package.zip")
            rendered = video_package_renderer.render_package(state.video_script, zip_path)
            state.rendered_files["video"] = rendered

graph_runner = TransformationGraphRunner()

