from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from enum import StrEnum
from uuid import UUID


class StudyGroup(StrEnum):
    TREATMENT = "treatment"
    CONTROL = "control"


class ParticipantStatus(StrEnum):
    ACTIVE = "active"
    COMPLETED = "completed"
    WITHDRAWN = "withdrawn"


class Gender(StrEnum):
    FEMALE = "F"
    MALE = "M"
    OTHER = "Other"


@dataclass(frozen=True)
class Participant:
    participant_id: UUID
    subject_id: str
    study_group: StudyGroup
    enrollment_date: date
    status: ParticipantStatus
    age: int
    gender: Gender
