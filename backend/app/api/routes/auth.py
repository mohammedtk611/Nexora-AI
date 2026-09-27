from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.services.auth_service import auth_service
from app.services.audit_service import audit_service
from app.api.deps import get_current_user
from app.db.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    user = auth_service.register_user(
        db, email=request.email, password=request.password, full_name=request.full_name
    )
    audit_service.log_action(db, action="register", resource="user", user_id=user.id, resource_id=user.id)
    return user

@router.post("/login", response_model=TokenResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, email=request.email, password=request.password)
    token = auth_service.create_token_for_user(user)
    audit_service.log_action(db, action="login", resource="user", user_id=user.id, resource_id=user.id)
    return TokenResponse(access_token=token, token_type="bearer", user_id=user.id, email=user.email)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    audit_service.log_action(db, action="logout", resource="user", user_id=current_user.id, resource_id=current_user.id)
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
