import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.auth_router import get_current_user
from app.infrastructure.database import get_db
from app.infrastructure.models import UserModel
from app.schemas.participant_schema import ParticipantCreate, ParticipantRead, ParticipantUpdate
from app.services import participant_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/participants",
    tags=["participants"],
    dependencies=[Depends(get_current_user)],
)


def _raise_http_exception(exc: Exception) -> None:
    """Re-raise HTTPException; convert other exceptions to 500 with clear detail."""
    if isinstance(exc, HTTPException):
        raise exc
    logger.exception("Service error in participants router")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An error occurred while processing your request.",
    ) from exc


@router.get("", response_model=list[ParticipantRead])
def list_participants(db: Session = Depends(get_db)) -> list:
    try:
        return participant_service.list_participants(db)
    except Exception as e:
        _raise_http_exception(e)


@router.post("", response_model=ParticipantRead, status_code=status.HTTP_201_CREATED)
def create_participant(
    body: ParticipantCreate,
    db: Session = Depends(get_db),
) -> object:
    try:
        return participant_service.create_participant(db, body)
    except Exception as e:
        _raise_http_exception(e)


@router.get("/{participant_id}", response_model=ParticipantRead)
def get_participant(participant_id: UUID, db: Session = Depends(get_db)) -> object:
    try:
        return participant_service.get_participant(db, participant_id)
    except Exception as e:
        _raise_http_exception(e)


@router.put("/{participant_id}", response_model=ParticipantRead)
def update_participant(
    participant_id: UUID,
    body: ParticipantUpdate,
    db: Session = Depends(get_db),
) -> object:
    try:
        return participant_service.update_participant(db, participant_id, body)
    except Exception as e:
        _raise_http_exception(e)


@router.delete("/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participant(
    participant_id: UUID,
    db: Session = Depends(get_db),
) -> None:
    try:
        participant_service.delete_participant(db, participant_id)
    except Exception as e:
        _raise_http_exception(e)
