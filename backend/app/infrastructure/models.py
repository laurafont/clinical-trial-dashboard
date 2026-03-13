import enum
from datetime import date
from uuid import UUID as UUIDType, uuid4

from sqlalchemy import Date, Enum, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database import Base


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


class ParticipantModel(Base):
    __tablename__ = "participants"

    participant_id: Mapped[UUIDType] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    subject_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    study_group: Mapped[StudyGroup] = mapped_column(
        Enum(StudyGroup), nullable=False
    )
    enrollment_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[ParticipantStatus] = mapped_column(
        Enum(ParticipantStatus), nullable=False
    )
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[Gender] = mapped_column(Enum(Gender), nullable=False)


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[UUIDType] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
