from __future__ import annotations

from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.domain.enums import Gender, ParticipantStatus, StudyGroup


class ParticipantCreate(BaseModel):
    subject_id: str
    study_group: StudyGroup
    enrollment_date: date
    status: ParticipantStatus
    age: int = Field(..., ge=0, le=150)
    gender: Gender


class ParticipantRead(ParticipantCreate):
    model_config = ConfigDict(from_attributes=True)

    participant_id: UUID


class ParticipantUpdate(BaseModel):
    subject_id: str | None = None
    study_group: StudyGroup | None = None
    enrollment_date: date | None = None
    status: ParticipantStatus | None = None
    age: int | None = Field(default=None, ge=0, le=150)
    gender: Gender | None = None
