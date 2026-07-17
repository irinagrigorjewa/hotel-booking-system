from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.schemas.auth import LoginRequest, RegisterRequest, TokenPairResponse
from app.services.auth import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    login,
    register,
)


router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])
SessionDependency = Annotated[Session, Depends(get_session)]


@router.post(
    "/register",
    response_model=TokenPairResponse,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"description": "Email already registered"}},
)
def register_user(request: RegisterRequest, session: SessionDependency) -> TokenPairResponse:
    try:
        return register(session, request)
    except EmailAlreadyRegisteredError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from error


@router.post(
    "/login",
    response_model=TokenPairResponse,
    responses={401: {"description": "Invalid credentials"}},
)
def login_user(request: LoginRequest, session: SessionDependency) -> TokenPairResponse:
    try:
        return login(session, request)
    except InvalidCredentialsError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        ) from error
