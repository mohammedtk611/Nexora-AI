import os
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.artifact import ArtifactResponse, ArtifactRegenerateRequest
from app.services.artifact_service import artifact_service
from app.services.audit_service import audit_service
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/artifacts", tags=["Artifacts"])

@router.get("", response_model=List[ArtifactResponse])
def list_artifacts(
    transformation_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return artifact_service.list_artifacts(db, transformation_id=transformation_id)

@router.get("/{artifact_id}", response_model=ArtifactResponse)
def get_artifact(
    artifact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return artifact_service.get_artifact(db, artifact_id)

@router.get("/{artifact_id}/download")
def download_artifact(
    artifact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    art = artifact_service.get_artifact(db, artifact_id)
    if not art.file_path or not os.path.exists(art.file_path):
        raise NotFoundError(message=f"File for artifact {artifact_id} does not exist on disk")

    audit_service.log_action(db, action="download_artifact", resource="artifact", user_id=current_user.id, resource_id=art.id)
    filename = os.path.basename(art.file_path)
    return FileResponse(path=art.file_path, filename=filename, media_type=art.mime_type or "application/octet-stream")

@router.post("/{artifact_id}/regenerate", response_model=ArtifactResponse)
def regenerate_artifact(
    artifact_id: str,
    request: Optional[ArtifactRegenerateRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    instructions = request.custom_instructions if request else None
    art = artifact_service.regenerate_artifact(db, artifact_id, custom_instructions=instructions)
    audit_service.log_action(db, action="regenerate_artifact", resource="artifact", user_id=current_user.id, resource_id=art.id)
    return art
