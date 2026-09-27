from typing import Optional
from pydantic import BaseModel, ConfigDict

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


