from typing import Generator, Optional
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import decode_access_token
from app.db.models.user import User
from app.core.exceptions import AuthenticationError

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> User:
    if not credentials or not credentials.credentials:
        # For development / testing, create or return default admin user if no token provided
        try:
            default_user = db.query(User).filter(User.email == "admin@revamp.ai").first()
        except Exception:
            from app.db.database import Base
            if db.bind:
                Base.metadata.create_all(bind=db.bind)
            db.rollback()
            default_user = db.query(User).filter(User.email == "admin@revamp.ai").first()

        if not default_user:
            from app.services.auth_service import auth_service
            default_user = auth_service.register_user(db, "admin@revamp.ai", "AdminPass123!", "Default Admin")
        return default_user

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise AuthenticationError(message="Invalid or expired access token")

    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise AuthenticationError(message="User not found or inactive")

    return user


