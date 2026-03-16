"""Participant API tests. Require auth_cookies for protected endpoints."""
import pytest
from fastapi.testclient import TestClient


def _participant_payload(
    subject_id: str = "SUB-001",
    study_group: str = "treatment",
    enrollment_date: str = "2024-01-15",
    status: str = "active",
    age: int = 35,
    gender: str = "M",
):
    return {
        "subject_id": subject_id,
        "study_group": study_group,
        "enrollment_date": enrollment_date,
        "status": status,
        "age": age,
        "gender": gender,
    }


def test_create_participant(client: TestClient, auth_cookies):
    """POST /participants returns 201 and the created participant."""
    response = client.post(
        "/participants",
        json=_participant_payload(),
        cookies=auth_cookies,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["subject_id"] == "SUB-001"
    assert data["study_group"] == "treatment"
    assert data["status"] == "active"
    assert data["age"] == 35
    assert data["gender"] == "M"
    assert "participant_id" in data


def test_get_participants(client: TestClient, auth_cookies):
    """GET /participants returns a list (possibly empty)."""
    response = client.get("/participants", cookies=auth_cookies)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_participant_by_id(client: TestClient, auth_cookies):
    """Create a participant then fetch by ID."""
    create_resp = client.post(
        "/participants",
        json=_participant_payload(subject_id="SUB-002"),
        cookies=auth_cookies,
    )
    assert create_resp.status_code == 201
    participant_id = create_resp.json()["participant_id"]

    get_resp = client.get(f"/participants/{participant_id}", cookies=auth_cookies)
    assert get_resp.status_code == 200
    assert get_resp.json()["participant_id"] == participant_id
    assert get_resp.json()["subject_id"] == "SUB-002"


def test_get_participant_not_found(client: TestClient, auth_cookies):
    """GET /participants/{id} with unknown UUID returns 404."""
    response = client.get(
        "/participants/00000000-0000-0000-0000-000000000000",
        cookies=auth_cookies,
    )
    assert response.status_code == 404


def test_unauthenticated_request(client: TestClient):
    """GET /participants without auth cookie returns 401."""
    response = client.get("/participants")
    assert response.status_code == 401
