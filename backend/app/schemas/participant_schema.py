from __future__ import annotations

from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.domain.enums import Gender, ParticipantStatus, StudyGroup

MIN_ENROLLMENT_YEAR = 1900


class ParticipantCreate(BaseModel):
    subject_id: str
    study_group: StudyGroup
    enrollment_date: date
    status: ParticipantStatus
    age: int = Field(..., ge=0, le=120)
    gender: Gender

    @field_validator("enrollment_date")
    @classmethod
    def enrollment_date_in_range(cls, v: date) -> date:
        today = date.today()
        if v.year < MIN_ENROLLMENT_YEAR:
            raise ValueError(
                f"Enrollment date year must be {MIN_ENROLLMENT_YEAR} or later"
            )
        if v > today:
            raise ValueError("Enrollment date cannot be in the future")
        return v


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
