import time
import uuid
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.exceptions import RevampAIException
from app.db.database import engine, Base

# Import all models to ensure metadata registration
import app.db.models  # noqa

# Initialize logging
setup_logging()

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Automated Cybersecurity Intelligence & Content Transformation API Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID & Logging Middleware
@app.middleware("http")
async def add_request_metadata(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()

    response = await call_next(request)

    duration = round((time.time() - start_time) * 1000, 2)
    logger.info(
        f"[{request_id}] {request.method} {request.url.path} -> {response.status_code} ({duration}ms)"
    )
    response.headers["X-Request-ID"] = request_id
    return response

# Custom Exception Handler
@app.exception_handler(RevampAIException)
async def revamp_ai_exception_handler(request: Request, exc: RevampAIException):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
                "request_id": request_id
            }
        }
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.error(f"[{request_id}] Unhandled Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
                "details": {},
                "request_id": request_id
            }
        }
    )

# Include API Routers
from app.api.routes import (
    auth,
    projects,
    ingestion,
    transformations,
    jobs,
    artifacts,
    knowledge_base,
    audit,
    settings as settings_route,
    health
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(ingestion.router, prefix="/api/v1")
app.include_router(transformations.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(artifacts.router, prefix="/api/v1")
app.include_router(knowledge_base.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")
app.include_router(settings_route.router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "status": "online"
    }
