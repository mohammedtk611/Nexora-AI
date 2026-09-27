import os
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from app.db.models.source_document import SourceDocument
from app.db.models.ingestion_job import IngestionJob
from app.storage.local_storage import storage_manager
from app.processors.pdf_processor import pdf_processor
from app.processors.docx_processor import docx_processor
from app.processors.text_processor import text_processor
from app.processors.image_processor import image_processor
from app.processors.audio_processor import audio_processor
from app.processors.video_processor import video_processor
from app.processors.url_processor import url_processor
from app.core.exceptions import ValidationError, NotFoundError

class IngestionService:
    def process_file_upload(
        self,
        db: Session,
        project_id: str,
        filename: str,
        content: bytes,
        content_type: str
    ) -> SourceDocument:
        ext = os.path.splitext(filename)[1].lower().strip(".")
        
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
        
        # Determine source type
        if ext in ["pdf"]:
            source_type = "pdf"
        elif ext in ["docx", "doc"]:
            source_type = "docx"
        elif ext in ["txt", "log"]:
            source_type = "txt"
        elif ext in ["png", "jpg", "jpeg", "webp"]:
            source_type = "image"
        elif ext in ["mp3", "wav", "m4a", "ogg"]:
            source_type = "audio"
        elif ext in ["mp4", "mkv", "avi", "mov"]:
            source_type = "video"
        else:
            source_type = "text"

        # Save to local storage
        saved_path = storage_manager.save_bytes("uploads", filename, content)

        # Create SourceDocument entry
        doc = SourceDocument(
            project_id=project_id,
            title=filename,
            source_type=source_type,
            file_path=saved_path,
            mime_type=content_type,
            file_size=len(content),
            status="processing"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # Execute extraction processor
        try:
            if source_type == "pdf":
                norm_doc = pdf_processor.process_file(saved_path, title=filename)
            elif source_type == "docx":
                norm_doc = docx_processor.process_file(saved_path, title=filename)
            elif source_type == "image":
                norm_doc = image_processor.process_file(saved_path, title=filename)
            elif source_type == "audio":
                norm_doc = audio_processor.process_file(saved_path, title=filename)
            elif source_type == "video":
                norm_doc = video_processor.process_file(saved_path, title=filename)
            else:
                raw_text = content.decode("utf-8", errors="ignore")
                norm_doc = text_processor.process(raw_text, title=filename)

            doc.raw_text = norm_doc.get("text", "")
            doc.normalized_doc = norm_doc
            doc.status = "completed"
        except Exception as e:
            doc.status = "failed"
            doc.error_message = str(e)
            db.commit()
            raise ValidationError(message=f"Failed to process file {filename}: {str(e)}")

        db.commit()
        db.refresh(doc)
        return doc

    def process_url_ingestion(self, db: Session, project_id: str, url: str, title: Optional[str] = None) -> SourceDocument:
        norm_doc = url_processor.process_url(url, title=title)
        
        doc = SourceDocument(
            project_id=project_id,
            title=norm_doc["title"],
            source_type="url",
            file_path=url,
            mime_type="text/html",
            raw_text=norm_doc["text"],
            normalized_doc=norm_doc,
            status="completed"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    def process_text_ingestion(self, db: Session, project_id: str, title: str, text: str) -> SourceDocument:
        norm_doc = text_processor.process(text, title=title)
        
        doc = SourceDocument(
            project_id=project_id,
            title=title,
            source_type="text",
            raw_text=text,
            normalized_doc=norm_doc,
            status="completed"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

ingestion_service = IngestionService()
