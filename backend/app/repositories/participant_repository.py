from uuid import UUID

from sqlalchemy.orm import Session

from app.infrastructure.models import ParticipantModel
from app.schemas.participant_schema import ParticipantCreate, ParticipantUpdate


def get_all(db: Session) -> list[ParticipantModel]:
    return db.query(ParticipantModel).all()


def get_by_id(db: Session, participant_id: UUID) -> ParticipantModel | None:
    return db.get(ParticipantModel, participant_id)


def create(db: Session, data: ParticipantCreate) -> ParticipantModel:
    participant = ParticipantModel(**data.model_dump())
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


def update(
    db: Session, participant_id: UUID, data: ParticipantUpdate
) -> ParticipantModel | None:
    participant = db.get(ParticipantModel, participant_id)
    if participant is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(participant, field, value)
    db.commit()
    db.refresh(participant)
    return participant


def delete(db: Session, participant_id: UUID) -> bool:
    participant = db.get(ParticipantModel, participant_id)
    if participant is None:
        return False
    db.delete(participant)
    db.commit()
    return True
