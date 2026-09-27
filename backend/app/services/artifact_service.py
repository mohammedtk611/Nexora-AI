from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.models.artifact import Artifact, ArtifactVersion
from app.core.exceptions import NotFoundError

class ArtifactService:
    def list_artifacts(self, db: Session, transformation_id: Optional[str] = None) -> List[Artifact]:
        query = db.query(Artifact)
        if transformation_id:
            query = query.filter(Artifact.transformation_id == transformation_id)
        return query.order_by(Artifact.created_at.desc()).all()

    def get_artifact(self, db: Session, artifact_id: str) -> Artifact:
        art = db.query(Artifact).filter(Artifact.id == artifact_id).first()
        if not art:
            raise NotFoundError(message=f"Artifact {artifact_id} not found")
        return art

    def regenerate_artifact(self, db: Session, artifact_id: str, custom_instructions: Optional[str] = None) -> Artifact:
        art = self.get_artifact(db, artifact_id)
        
        # Save current version to ArtifactVersion history
        version_count = db.query(ArtifactVersion).filter(ArtifactVersion.artifact_id == artifact_id).count()
        old_version = ArtifactVersion(
            artifact_id=art.id,
            version_number=version_count + 1,
            content=art.content,
            file_path=art.file_path
        )
        db.add(old_version)
        db.commit()

        # Update metadata for regeneration
        art.status = "regenerated"
        db.commit()
        db.refresh(art)
        return art

artifact_service = ArtifactService()
