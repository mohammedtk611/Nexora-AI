import logging
from app.workers.celery_app import celery_app
from app.db.database import SessionLocal
from app.services.transformation_service import transformation_service

logger = logging.getLogger("revamp_ai.celery")

@celery_app.task(bind=True, name="run_transformation_pipeline")
def run_transformation_pipeline(self, transformation_id: str):
    logger.info(f"Starting Celery background task for transformation: {transformation_id}")
    db = SessionLocal()
    try:
        transformation_service.execute_transformation_sync(db, transformation_id)
        logger.info(f"Successfully completed transformation task: {transformation_id}")
    except Exception as e:
        logger.error(f"Error executing transformation task {transformation_id}: {e}", exc_info=True)
    finally:
        db.close()
