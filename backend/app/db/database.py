import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

import socket
from urllib.parse import urlparse, urlunparse

def normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    try:
        parsed = urlparse(url)
        host = parsed.hostname
        if host and host.startswith("dpg-") and "." not in host:
            # Check if internal host resolves
            try:
                socket.gethostbyname(host)
            except Exception:
                # Internal DNS failed (e.g. cross-region or private network routing)
                for region in ["oregon", "frankfurt", "ohio", "singapore"]:
                    candidate = f"{host}.{region}-postgres.render.com"
                    try:
                        socket.gethostbyname(candidate)
                        netloc = parsed.netloc.replace(host, candidate)
                        url = urlunparse(parsed._replace(netloc=netloc))
                        break
                    except Exception:
                        pass
    except Exception:
        pass
    return url

# Create engine compatible with PostgreSQL and SQLite (for testing/local execution)
db_url = normalize_database_url(settings.DATABASE_URL)

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    # Ensure SQLite directory exists
    db_path = db_url.replace("sqlite:///", "")
    if db_path and db_path != ":memory:":
        db_dir = os.path.dirname(db_path)
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

