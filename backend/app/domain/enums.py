# Shared enums for participant data, single source of truth for backend.

import enum


class StudyGroup(str, enum.Enum):
    TREATMENT = "treatment"
    CONTROL = "control"


class ParticipantStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    WITHDRAWN = "withdrawn"


class Gender(str, enum.Enum):
    F = "F"
    M = "M"
    OTHER = "Other"
