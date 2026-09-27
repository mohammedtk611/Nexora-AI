import os
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.db.models.transformation import Transformation
from app.db.models.source_document import SourceDocument
from app.db.models.agent_run import AgentRun
from app.db.models.artifact import Artifact
from app.agents.state import TransformationState
from app.agents.graph import graph_runner
from app.core.exceptions import NotFoundError, ValidationError

class TransformationService:
    def create_transformation(
        self,
        db: Session,
        project_id: str,
        source_document_ids: List[str],
        target_audience: str,
        tone: str,
        objective: str,
        urgency_level: str,
        language: str,
        output_formats: List[str]
    ) -> Transformation:
        from app.db.models.project import Project
        from app.db.models.user import User
        proj = db.query(Project).filter(Project.id == project_id).first()
        if not proj:
            user = db.query(User).first()
            if not user:
                from app.services.auth_service import auth_service
                user = auth_service.register_user(db, "admin@revamp.ai", "AdminPass123!", "Default Admin")
            proj = Project(
                id=project_id,
                name="Cybersecurity Intelligence Project",
                description="Auto-created default project",
                owner_id=user.id
            )
            db.add(proj)
            db.commit()

        transformation = Transformation(
            project_id=project_id,
            source_document_ids=source_document_ids,
            target_audience=target_audience,
            tone=tone,
            objective=objective,
            urgency_level=urgency_level,
            language=language,
            output_formats=output_formats,
            status="queued",
            current_stage="queued"
        )
        db.add(transformation)
        db.commit()
        db.refresh(transformation)
        return transformation

    def execute_transformation_sync(self, db: Session, transformation_id: str) -> Transformation:
        trans = db.query(Transformation).filter(Transformation.id == transformation_id).first()
        if not trans:
            raise NotFoundError(message=f"Transformation {transformation_id} not found")

        trans.status = "running"
        trans.current_stage = "ingestion_agent"
        db.commit()

        # Fetch source documents texts
        docs = db.query(SourceDocument).filter(SourceDocument.id.in_(trans.source_document_ids or [])).all()
        source_texts = [d.raw_text for d in docs if d.raw_text]
        if not source_texts:
            # Fallback text if none found
            source_texts = ["No source text content provided."]

        initial_state = TransformationState(
            transformation_id=trans.id,
            project_id=trans.project_id,
            source_document_ids=trans.source_document_ids or [],
            source_texts=source_texts,
            target_audience=trans.target_audience,
            tone=trans.tone,
            objective=trans.objective,
            urgency_level=trans.urgency_level,
            language=trans.language,
            output_formats=trans.output_formats or []
        )

        def progress_callback(stage_name: str, status: str, extra: Dict[str, Any]):
            trans.current_stage = stage_name
            db.commit()
            
            # Record AgentRun
            agent_run = db.query(AgentRun).filter(
                AgentRun.transformation_id == trans.id,
                AgentRun.agent_name == stage_name
            ).first()
            if not agent_run:
                agent_run = AgentRun(
                    transformation_id=trans.id,
                    agent_name=stage_name,
                    status=status
                )
                db.add(agent_run)
            else:
                agent_run.status = status
            db.commit()

        # Run graph execution
        final_state = graph_runner.execute(initial_state, progress_callback=progress_callback)

        if final_state.error:
            trans.status = "failed"
            trans.error_message = final_state.error
            db.commit()
            return trans

        trans.status = "completed"
        trans.current_stage = "completed"
        if final_state.central_context:
            ico_dump = final_state.central_context.model_dump()
            trans.central_context = ico_dump
            trans.ico_data = ico_dump
            trans.detected_intent = ico_dump.get("detected_intent", "security_alert")
            trans.ico_status = ico_dump.get("status", "approved")
            
            # Store version 1 record if none exists
            from app.db.models.transformation import ICOVersion
            existing = db.query(ICOVersion).filter(ICOVersion.transformation_id == trans.id, ICOVersion.version_number == 1).first()
            if not existing:
                v1 = ICOVersion(
                    transformation_id=trans.id,
                    version_number=1,
                    status=trans.ico_status,
                    ico_data=ico_dump,
                    edited_by="system"
                )
                db.add(v1)

        db.commit()

        # Persist generated artifacts to database
        self._persist_artifacts(db, trans, final_state)

        return trans

    def _persist_artifacts(self, db: Session, trans: Transformation, state: TransformationState):
        artifacts_map = {
            "executive_brief": (state.executive_brief, "Executive Brief Report", "application/json", None),
            "advisory": (state.advisory, "Security Advisory Alert", "application/pdf", state.rendered_files.get("advisory")),
            "social": (state.social, "Social Media Campaign", "application/json", None),
            "presentation": (state.presentation, "Executive Presentation Deck", "application/vnd.openxmlformats-officedocument.presentationml.presentation", state.rendered_files.get("presentation")),
            "infographic": (state.infographic, "Security Intelligence Infographic", "image/svg+xml", state.rendered_files.get("infographic")),
            "video": (state.video_script, "Video Package Storyboard & Subtitles", "application/zip", state.rendered_files.get("video")),
        }

        for art_type, (content_json, title, mime_type, file_path) in artifacts_map.items():
            if content_json or file_path:
                file_size = 0
                if file_path and os.path.exists(file_path):
                    file_size = os.path.getsize(file_path)

                art = Artifact(
                    transformation_id=trans.id,
                    type=art_type,
                    title=title,
                    status="generated",
                    content=content_json,
                    file_path=file_path,
                    mime_type=mime_type,
                    size=file_size,
                    validation_status=state.compliance_report
                )
                db.add(art)
        db.commit()

transformation_service = TransformationService()
