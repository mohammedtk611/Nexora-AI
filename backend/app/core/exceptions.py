from typing import Any, Dict, Optional
from fastapi import HTTPException, status

class NexoraAIException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class AuthenticationError(NexoraAIException):
    def __init__(self, message: str = "Authentication failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="AUTHENTICATION_FAILED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details,
        )

class AuthorizationError(NexoraAIException):
    def __init__(self, message: str = "Permission denied", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="PERMISSION_DENIED",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            details=details,
        )

class NotFoundError(NexoraAIException):
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="NOT_FOUND",
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
        )

class ValidationError(NexoraAIException):
    def __init__(self, message: str = "Validation error", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )

class GenerationError(NexoraAIException):
    def __init__(self, message: str = "Generation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="GENERATION_FAILED",
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details,
        )
