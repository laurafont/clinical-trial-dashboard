"""Auth API tests: login, logout, GET /auth/me (cookie-based auth)."""
import pytest
from fastapi.testclient import TestClient


def test_login_success(client: TestClient):
    """POST /auth/login with valid credentials returns 200 and sets auth cookie."""
    response = client.post(
        "/auth/login",
        json={"username": "admin", "password": "migx123"},
    )
    assert response.status_code == 200
    assert response.json() == {"message": "ok"}
    assert "access_token" in response.cookies


def test_login_wrong_password(client: TestClient):
    """POST /auth/login with wrong password returns 401."""
    response = client.post(
        "/auth/login",
        json={"username": "admin", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_login_unknown_user(client: TestClient):
    """POST /auth/login with unknown username returns 401."""
    response = client.post(
        "/auth/login",
        json={"username": "unknownuser", "password": "migx123"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_me_authenticated(client: TestClient, auth_cookies):
    """GET /auth/me with valid cookie returns 200 and session user."""
    response = client.get("/auth/me", cookies=auth_cookies)
    assert response.status_code == 200
    assert response.json() == {"username": "admin"}


def test_me_unauthenticated(client: TestClient):
    """GET /auth/me without cookie returns 401."""
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"


def test_logout(client: TestClient, auth_cookies):
    """POST /auth/logout with valid cookie returns 204; subsequent /auth/me returns 401."""
    response = client.post("/auth/logout", cookies=auth_cookies)
    assert response.status_code == 204

    # Cookie should be cleared; next request without cookie is unauthenticated
    me_response = client.get("/auth/me")
    assert me_response.status_code == 401


def test_login_validation_missing_body(client: TestClient):
    """POST /auth/login with empty or missing body returns 422."""
    response = client.post("/auth/login", json={})
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)
    assert any("username" in str(e).lower() or "password" in str(e).lower() for e in detail)


def test_login_validation_short_password(client: TestClient):
    """POST /auth/login with password shorter than 6 characters returns 422."""
    response = client.post(
        "/auth/login",
        json={"username": "admin", "password": "short"},
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)


def test_login_validation_empty_username(client: TestClient):
    """POST /auth/login with empty username returns 422."""
    response = client.post(
        "/auth/login",
        json={"username": "", "password": "migx123"},
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)
