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
            active_intent = ico.user_intent or ico.detected_intent or "general_report"
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
                # Isolate RAG query strictly to current source documents to prevent cross-run pollution
                query = f"{ico.core_topic} {' '.join(ico.entities[:3])}"
                passages = rag_retriever.retrieve(
                    query=query,
                    top_k=3,
                    project_id=state.project_id,
                    document_ids=state.source_document_ids if state.source_document_ids else None
                )
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

            # Stage 5: Generation (Sequential execution across active routed agents)
            for agent_name in routed_formats:
                try:
                    if agent_name == "executive_brief":
                        update_progress("executive_agent", "running")
                        state.executive_brief = executive_agent.run(state)
                        update_progress("executive_agent", "completed")
                    elif agent_name == "advisory":
                        update_progress("advisory_agent", "running")
                        state.advisory = advisory_agent.run(state)
                        update_progress("advisory_agent", "completed")
                    elif agent_name == "social":
                        update_progress("social_agent", "running")
                        state.social = social_agent.run(state)
                        update_progress("social_agent", "completed")
                    elif agent_name == "presentation":
                        update_progress("presentation_agent", "running")
                        state.presentation = presentation_agent.run(state)
                        update_progress("presentation_agent", "completed")
                    elif agent_name == "infographic":
                        update_progress("infographic_agent", "running")
                        state.infographic = infographic_agent.run(state)
                        update_progress("infographic_agent", "completed")
                    elif agent_name in ["video", "video_script"]:
                        update_progress("video_agent", "running")
                        state.video_script = video_agent.run(state)
                        update_progress("video_agent", "completed")
                except Exception as ex:
                    logger.error(f"Error running agent {agent_name}: {ex}")

            # Stage 6: Compliance & Factual Consistency Validation Check
            update_progress("compliance_agent", "running")
            report = compliance_agent.run(state)
            state.compliance_report = report
            update_progress("compliance_agent", "completed", {"status": report.get("status")})

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
        all_formats = ["executive_brief", "advisory", "social", "presentation", "infographic", "video"]
        if requested_formats:
            return [fmt for fmt in all_formats if fmt in requested_formats]
        return all_formats

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
            p_title = state.presentation.get("title") or (state.central_context.core_topic if state.central_context else "Executive Presentation")
            rendered = pptx_renderer.render_presentation(state.presentation.get("slides", []), pptx_path, presentation_title=p_title)
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

