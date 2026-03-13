from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth_router, participant_router
from app.core.security import hash_password
from app.infrastructure.database import Base, SessionLocal, engine
from app.infrastructure.models import UserModel  # noqa: F401 — registers model with Base


def _create_tables() -> None:
    # Import all models so Base knows about them before create_all.
    from app.infrastructure import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def _seed_admin() -> None:
    db = SessionLocal()
    try:
        exists = db.query(UserModel).filter(UserModel.username == "admin").first()
        if not exists:
            db.add(UserModel(username="admin", hashed_password=hash_password("migx123")))
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    _create_tables()
    _seed_admin()
    yield


app = FastAPI(
    title="Clinical Trial Dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost",       # Docker / nginx
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(participant_router.router)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}
