from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=6, max_length=255)


class LoginSuccess(BaseModel):
    message: str = "ok"


class SessionUser(BaseModel):
    username: str
