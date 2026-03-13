from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from uuid import UUID

from app.domain.enums import Gender, ParticipantStatus, StudyGroup


@dataclass(frozen=True)
class Participant:
    participant_id: UUID
    subject_id: str
    study_group: StudyGroup
    enrollment_date: date
    status: ParticipantStatus
    age: int
    gender: Gender
