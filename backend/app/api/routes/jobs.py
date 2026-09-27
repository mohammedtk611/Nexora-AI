from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.models.transformation import Transformation
from app.db.models.agent_run import AgentRun
from app.schemas.job import JobStatusResponse, AgentProgressStatus
from app.utils.sse import sse_generator
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/jobs", tags=["Jobs & Real-time Progress"])

@router.get("/{job_id}", response_model=JobStatusResponse)
def get_job_status(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trans = db.query(Transformation).filter(Transformation.id == job_id).first()
    if not trans:
        raise NotFoundError(message=f"Job {job_id} not found")

    agent_runs = db.query(AgentRun).filter(AgentRun.transformation_id == job_id).all()
    agent_statuses = [
        AgentProgressStatus(
            name=run.agent_name,
            status=run.status,
            error=run.error
        )
        for run in agent_runs
    ]

    return JobStatusResponse(
        job_id=trans.id,
        status=trans.status,
        current_stage=trans.current_stage or "queued",
        agents=agent_statuses,
        error_message=trans.error_message
    )

@router.post("/{job_id}/cancel")
def cancel_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trans = db.query(Transformation).filter(Transformation.id == job_id).first()
    if not trans:
        raise NotFoundError(message=f"Job {job_id} not found")

    trans.status = "cancelled"
    trans.current_stage = "cancelled"
    db.commit()
    return {"message": f"Job {job_id} cancelled successfully", "status": "cancelled"}

@router.get("/{job_id}/events")
async def stream_job_events(job_id: str):
    return StreamingResponse(
        sse_generator(job_id),
        media_type="text/event-stream"
    )
