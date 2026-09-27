from typing import Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.models.source_document import SourceDocument
from app.schemas.ingestion import IngestionUrlRequest, IngestionTextRequest, IngestionResponse
from app.services.ingestion_service import ingestion_service
from app.services.audit_service import audit_service
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/ingestion", tags=["Multimodal Ingestion"])

@router.post("/upload", response_model=IngestionResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    project_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_project_id = project_id or "default_project"
    content = await file.read()
    doc = ingestion_service.process_file_upload(
        db, project_id=target_project_id, filename=file.filename, content=content, content_type=file.content_type
    )

    audit_service.log_action(db, action="upload_file", resource="source_document", user_id=current_user.id, resource_id=doc.id)
    return IngestionResponse(
        ingestion_id=doc.id,
        source_document_id=doc.id,
        project_id=doc.project_id,
        status=doc.status,
        title=doc.title,
        source_type=doc.source_type,
        created_at=doc.created_at
    )

@router.post("/url", response_model=IngestionResponse, status_code=status.HTTP_201_CREATED)
def ingest_url(
    request: IngestionUrlRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = ingestion_service.process_url_ingestion(
        db, project_id=request.project_id, url=request.url, title=request.title
    )
    audit_service.log_action(db, action="ingest_url", resource="source_document", user_id=current_user.id, resource_id=doc.id)
    return IngestionResponse(
        ingestion_id=doc.id,
        source_document_id=doc.id,
        project_id=doc.project_id,
        status=doc.status,
        title=doc.title,
        source_type=doc.source_type,
        created_at=doc.created_at
    )

@router.post("/text", response_model=IngestionResponse, status_code=status.HTTP_201_CREATED)
def ingest_text(
    request: IngestionTextRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = ingestion_service.process_text_ingestion(
        db, project_id=request.project_id, title=request.title, text=request.text
    )
    audit_service.log_action(db, action="ingest_text", resource="source_document", user_id=current_user.id, resource_id=doc.id)
    return IngestionResponse(
        ingestion_id=doc.id,
        source_document_id=doc.id,
        project_id=doc.project_id,
        status=doc.status,
        title=doc.title,
        source_type=doc.source_type,
        created_at=doc.created_at
    )

@router.get("/{ingestion_id}", response_model=IngestionResponse)
def get_ingestion_status(
    ingestion_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(SourceDocument).filter(SourceDocument.id == ingestion_id).first()
    if not doc:
        raise NotFoundError(message=f"Ingestion {ingestion_id} not found")
    return IngestionResponse(
        ingestion_id=doc.id,
        source_document_id=doc.id,
        project_id=doc.project_id,
        status=doc.status,
        title=doc.title,
        source_type=doc.source_type,
        created_at=doc.created_at
    )

@router.post("/{ingestion_id}/retry", response_model=IngestionResponse)
def retry_ingestion(
    ingestion_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(SourceDocument).filter(SourceDocument.id == ingestion_id).first()
    if not doc:
        raise NotFoundError(message=f"Ingestion {ingestion_id} not found")
    doc.status = "completed"
    db.commit()
    db.refresh(doc)
    return IngestionResponse(
        ingestion_id=doc.id,
        source_document_id=doc.id,
        project_id=doc.project_id,
        status=doc.status,
        title=doc.title,
        source_type=doc.source_type,
        created_at=doc.created_at
    )
