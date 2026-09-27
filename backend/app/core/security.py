import datetime
from typing import Any, Dict, Optional, Union
import jwt
try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerifyMismatchError
    _ph = PasswordHasher()
    def hash_password(password: str) -> str:
        return _ph.hash(password)
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return _ph.verify(hashed_password, plain_password)
        except Exception:
            return False
except ImportError:
    import hashlib
    import secrets
    def hash_password(password: str) -> str:
        salt = secrets.token_hex(16)
        h = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return f"pbkdf2_sha256${salt}${h.hex()}"
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            if hashed_password.startswith("pbkdf2_sha256$"):
                _, salt, h_hex = hashed_password.split("$")
                h = hashlib.pbkdf2_hmac('sha256', plain_password.encode(), salt.encode(), 100000)
                return h.hex() == h_hex
            return False
        except Exception:
            return False

from app.core.config import settings

def create_access_token(subject: Union[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
