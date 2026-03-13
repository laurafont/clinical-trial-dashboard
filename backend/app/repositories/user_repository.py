from sqlalchemy.orm import Session

from app.infrastructure.models import UserModel


def get_by_username(db: Session, username: str) -> UserModel | None:
    return db.query(UserModel).filter(UserModel.username == username).first()
