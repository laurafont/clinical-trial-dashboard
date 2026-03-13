from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.infrastructure.models import ParticipantModel
from app.repositories import participant_repository
from app.schemas.participant_schema import ParticipantCreate, ParticipantUpdate


def list_participants(db: Session) -> list[ParticipantModel]:
    return participant_repository.get_all(db)


def get_participant(db: Session, participant_id: UUID) -> ParticipantModel:
    participant = participant_repository.get_by_id(db, participant_id)
    if participant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant {participant_id} not found",
        )
    return participant


def create_participant(db: Session, data: ParticipantCreate) -> ParticipantModel:
    return participant_repository.create(db, data)


def update_participant(
    db: Session, participant_id: UUID, data: ParticipantUpdate
) -> ParticipantModel:
    participant = participant_repository.update(db, participant_id, data)
    if participant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant {participant_id} not found",
        )
    return participant


def delete_participant(db: Session, participant_id: UUID) -> None:
    deleted = participant_repository.delete(db, participant_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant {participant_id} not found",
        )
