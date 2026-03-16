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


# --- Validation and error shape tests ---


def test_create_participant_validation_missing_required(client: TestClient, auth_cookies):
    """POST /participants with missing required field returns 422."""
    payload = _participant_payload()
    del payload["subject_id"]
    response = client.post("/participants", json=payload, cookies=auth_cookies)
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)


def test_create_participant_validation_invalid_enum(client: TestClient, auth_cookies):
    """POST /participants with invalid study_group returns 422."""
    response = client.post(
        "/participants",
        json=_participant_payload(study_group="invalid_group"),
        cookies=auth_cookies,
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)


def test_create_participant_validation_age_out_of_range(client: TestClient, auth_cookies):
    """POST /participants with age < 0 or > 120 returns 422."""
    response = client.post(
        "/participants",
        json=_participant_payload(age=-1),
        cookies=auth_cookies,
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)

    response_high = client.post(
        "/participants",
        json=_participant_payload(age=121),
        cookies=auth_cookies,
    )
    assert response_high.status_code == 422


def test_create_participant_validation_enrollment_date_future(client: TestClient, auth_cookies):
    """POST /participants with enrollment_date in the future returns 422."""
    response = client.post(
        "/participants",
        json=_participant_payload(enrollment_date="2099-12-31"),
        cookies=auth_cookies,
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)


def test_create_participant_validation_enrollment_date_before_1900(client: TestClient, auth_cookies):
    """POST /participants with enrollment_date year before 1900 returns 422."""
    response = client.post(
        "/participants",
        json=_participant_payload(enrollment_date="1899-01-01"),
        cookies=auth_cookies,
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)


def test_create_participant_duplicate_subject_id(client: TestClient, auth_cookies):
    """POST /participants with duplicate subject_id returns 500 (unique constraint)."""
    payload = _participant_payload(subject_id="SUB-DUP")
    client.post("/participants", json=payload, cookies=auth_cookies)
    response = client.post("/participants", json=payload, cookies=auth_cookies)
    assert response.status_code == 500
    assert "detail" in response.json()


def test_update_participant_validation_invalid_enum(client: TestClient, auth_cookies):
    """PUT /participants with invalid status returns 422."""
    create_resp = client.post(
        "/participants",
        json=_participant_payload(subject_id="SUB-UPD"),
        cookies=auth_cookies,
    )
    assert create_resp.status_code == 201
    participant_id = create_resp.json()["participant_id"]

    response = client.put(
        f"/participants/{participant_id}",
        json={"status": "invalid_status"},
        cookies=auth_cookies,
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)
