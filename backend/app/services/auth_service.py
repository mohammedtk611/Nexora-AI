from typing import Optional
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import AuthenticationError, ValidationError

class AuthService:
    def register_user(self, db: Session, email: str, password: str, full_name: Optional[str] = None) -> User:
        existing = db.query(User).filter(User.email == email.lower()).first()
        if existing:
            raise ValidationError(message="User with this email already exists")

        hashed = hash_password(password)
        user = User(
            email=email.lower(),
            hashed_password=hashed,
            full_name=full_name,
            role="analyst"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def authenticate_user(self, db: Session, email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user or not verify_password(password, user.hashed_password):
            raise AuthenticationError(message="Invalid email or password")
        if not user.is_active:
            raise AuthenticationError(message="User account is inactive")
        return user
        if not user.is_active:
            raise AuthenticationError(message="User account is inactive")
        return user

    def create_token_for_user(self, user: User) -> str:
        return create_access_token(subject=user.id)

    def get_user_by_id(self, db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

auth_service = AuthService()
