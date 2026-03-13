from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.routes.auth_router import get_current_user
from app.infrastructure.database import get_db
from app.infrastructure.models import UserModel
from app.schemas.participant_schema import ParticipantCreate, ParticipantRead, ParticipantUpdate
from app.services import participant_service

router = APIRouter(
    prefix="/participants",
    tags=["participants"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=list[ParticipantRead])
def list_participants(db: Session = Depends(get_db)) -> list:
    return participant_service.list_participants(db)


@router.post("", response_model=ParticipantRead, status_code=status.HTTP_201_CREATED)
def create_participant(
    body: ParticipantCreate,
    db: Session = Depends(get_db),
) -> object:
    return participant_service.create_participant(db, body)


@router.get("/{participant_id}", response_model=ParticipantRead)
def get_participant(participant_id: UUID, db: Session = Depends(get_db)) -> object:
    return participant_service.get_participant(db, participant_id)


@router.put("/{participant_id}", response_model=ParticipantRead)
def update_participant(
    participant_id: UUID,
    body: ParticipantUpdate,
    db: Session = Depends(get_db),
) -> object:
    return participant_service.update_participant(db, participant_id, body)


@router.delete("/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participant(
    participant_id: UUID,
    db: Session = Depends(get_db),
) -> None:
    participant_service.delete_participant(db, participant_id)
