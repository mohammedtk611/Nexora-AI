from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db, SessionLocal
from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.models.transformation import Transformation, ICOVersion
from app.schemas.transformation import (
    TransformationCreateRequest,
    TransformationCreateResponse,
    TransformationResponse,
    ICOUpdateRequest,
    ICOApproveRequest,
    ICOSchema
)
from app.services.transformation_service import transformation_service
from app.services.audit_service import audit_service
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/transformations", tags=["Transformations"])

def _run_transformation_background(transformation_id: str):
    db = SessionLocal()
    try:
        transformation_service.execute_transformation_sync(db, transformation_id)
    except Exception as e:
        import logging
        logging.getLogger("revamp_ai").error(f"Background execution failed: {e}")
    finally:
        db.close()

@router.post("", response_model=TransformationCreateResponse, status_code=status.HTTP_201_CREATED)
def create_transformation(
    request: TransformationCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trans = transformation_service.create_transformation(
        db,
        project_id=request.project_id,
        source_document_ids=request.source_document_ids,
        target_audience=request.target_audience,
        tone=request.tone,
        objective=request.objective,
        urgency_level=request.urgency_level,
        language=request.language,
        output_formats=request.output_formats
    )
    if request.user_intent:
        trans.user_intent = request.user_intent
        db.commit()

    # Trigger background transformation execution reliably
    background_tasks.add_task(_run_transformation_background, trans.id)

    audit_service.log_action(db, action="create_transformation", resource="transformation", user_id=current_user.id, resource_id=trans.id)

    return TransformationCreateResponse(
        transformation_id=trans.id,
        job_id=trans.id,
        status=trans.status
    )

@router.get("", response_model=List[TransformationResponse])
def list_transformations(
    project_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    urgency: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transformation)
    if project_id:
        query = query.filter(Transformation.project_id == project_id)
    if status:
        query = query.filter(Transformation.status == status)
    if urgency:
        query = query.filter(Transformation.urgency_level == urgency)

    transformations = query.order_by(Transformation.created_at.desc()).offset(skip).limit(limit).all()
    return transformations

@router.get("/{transformation_id}", response_model=TransformationResponse)
def get_transformation(
    transformation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trans = db.query(Transformation).filter(Transformation.id == transformation_id).first()
    if not trans:
        raise NotFoundError(message=f"Transformation {transformation_id} not found")
    return trans

@router.get("/{transformation_id}/ico")
def get_transformation_ico(
    transformation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trans = db.query(Transformation).filter(Transformation.id == transformation_id).first()
    if not trans:
        raise NotFoundError(message=f"Transformation {transformation_id} not found")
    
    ico = trans.central_context or {}
    versions = db.query(ICOVersion).filter(ICOVersion.transformation_id == transformation_id).order_by(ICOVersion.version_number.desc()).all()
    return {
        "transformation_id": trans.id,
        "version": trans.ico_version or 1,
        "status": trans.ico_status or "approved",
        "detected_intent": trans.detected_intent or "security_alert",
        "user_intent": trans.user_intent,
        "ico": ico,
        "version_history": [
            {
                "version_number": v.version_number,
                "status": v.status,
                "edited_by": v.edited_by,
                "created_at": v.created_at
            }
            for v in versions
        ]
    }

@router.put("/{transformation_id}/ico")
def update_transformation_ico(
    transformation_id: str,
    request: ICOUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trans = db.query(Transformation).filter(Transformation.id == transformation_id).first()
    if not trans:
        raise NotFoundError(message=f"Transformation {transformation_id} not found")
    
    current_ico = trans.central_context or {}
    updated_dict = dict(current_ico)

    for field, val in request.model_dump(exclude_unset=True).items():
        if val is not None:
            if field == "user_intent":
                trans.user_intent = val
                updated_dict["user_intent"] = val
            else:
                updated_dict[field] = val

    new_version_num = (trans.ico_version or 1) + 1
    trans.ico_version = new_version_num
    trans.ico_status = "review"
    trans.central_context = updated_dict

    # Record version
    version_entry = ICOVersion(
        transformation_id=trans.id,
        version_number=new_version_num,
        status="review",
        ico_data=updated_dict,
        edited_by=current_user.email
    )
    db.add(version_entry)
    db.commit()
    db.refresh(trans)

    audit_service.log_action(db, action="update_ico", resource="transformation", user_id=current_user.id, resource_id=trans.id)

    return {
        "message": "ICO updated successfully",
        "version": new_version_num,
        "status": trans.ico_status,
        "ico": trans.central_context
    }

@router.post("/{transformation_id}/ico/approve")
def approve_transformation_ico(
    transformation_id: str,
    request: Optional[ICOApproveRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trans = db.query(Transformation).filter(Transformation.id == transformation_id).first()
    if not trans:
        raise NotFoundError(message=f"Transformation {transformation_id} not found")
    
    trans.ico_status = "approved"
    if trans.central_context:
        trans.central_context["status"] = "approved"

    db.commit()
    db.refresh(trans)

    audit_service.log_action(db, action="approve_ico", resource="transformation", user_id=current_user.id, resource_id=trans.id)

    return {
        "message": "ICO approved",
        "version": trans.ico_version,
        "status": trans.ico_status,
        "ico": trans.central_context
    }

@router.post("/{transformation_id}/generate")
def trigger_generation(
    transformation_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trans = db.query(Transformation).filter(Transformation.id == transformation_id).first()
    if not trans:
        raise NotFoundError(message=f"Transformation {transformation_id} not found")
    
    background_tasks.add_task(_run_transformation_background, trans.id)

    audit_service.log_action(db, action="trigger_generation", resource="transformation", user_id=current_user.id, resource_id=trans.id)

    return {
        "message": "Transformation generation triggered",
        "transformation_id": trans.id,
        "status": trans.status
    }

