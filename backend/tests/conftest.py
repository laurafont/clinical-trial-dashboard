"""
Pytest configuration and fixtures for backend tests.
Uses an in-memory SQLite database; overrides get_db so tests use the test engine.
"""
import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Set env before any app import that reads settings (so app uses SQLite when imported)
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "60")

from app.core.security import hash_password
from app.infrastructure.database import Base, get_db
from app.infrastructure.models import UserModel  # noqa: F401
from app.main import app  # noqa: E402

# Import so Base has all models
from app.infrastructure import models  # noqa: E402, F401

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db() -> Generator[Session, None, None]:
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


def _setup_test_db() -> None:
    Base.metadata.create_all(bind=test_engine)
    db = TestSessionLocal()
    try:
        if db.query(UserModel).filter(UserModel.username == "admin").first() is None:
            db.add(UserModel(username="admin", hashed_password=hash_password("migx123")))
            db.commit()
    finally:
        db.close()


@pytest.fixture(scope="module")
def setup_db():
    """Create tables and seed admin once per test module."""
    _setup_test_db()
    yield


@pytest.fixture
def client(setup_db):
    """Test client with get_db overridden to use in-memory SQLite."""
    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app=app) as c:
            yield c
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def auth_cookies(client: TestClient):
    """Log in as admin and return cookies for subsequent requests (cookie-only auth)."""
    response = client.post(
        "/auth/login",
        json={"username": "admin", "password": "migx123"},
    )
    assert response.status_code == 200, response.text
    return response.cookies
