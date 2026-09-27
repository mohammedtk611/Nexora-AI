from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.models.project import Project
from app.schemas.project import ProjectCreateRequest, ProjectUpdateRequest, ProjectResponse
from app.services.audit_service import audit_service
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = db.query(Project).filter(Project.owner_id == current_user.id).order_by(Project.created_at.desc()).all()
    return projects

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    request: ProjectCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = Project(
        name=request.name,
        description=request.description,
        owner_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    audit_service.log_action(db, action="create_project", resource="project", user_id=current_user.id, resource_id=project.id)
    return project

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise NotFoundError(message=f"Project {project_id} not found")
    return project

@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    request: ProjectUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise NotFoundError(message=f"Project {project_id} not found")

    if request.name is not None:
        project.name = request.name
    if request.description is not None:
        project.description = request.description
    if request.status is not None:
        project.status = request.status

    db.commit()
    db.refresh(project)
    audit_service.log_action(db, action="update_project", resource="project", user_id=current_user.id, resource_id=project.id)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise NotFoundError(message=f"Project {project_id} not found")

    db.delete(project)
    db.commit()
    audit_service.log_action(db, action="delete_project", resource="project", user_id=current_user.id, resource_id=project_id)
    return None
