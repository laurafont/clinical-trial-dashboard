# Clinical Trial Dashboard

A full-stack application for visualizing and managing clinical trial participant data. Built with React + TypeScript on the frontend and FastAPI + PostgreSQL on the backend, fully containerized with Docker Compose.

---

## Table of Contents

1. [How to Run](#1-how-to-run)
2. [How to Test](#2-how-to-test)
3. [Authenticate and Call a Protected Route](#3-authenticate-and-call-a-protected-route)
4. [Technologies Used and Why](#4-technologies-used-and-why)
5. [What Was Completed and What Was Skipped](#5-what-was-completed-and-what-was-skipped)
6. [What I'd Improve with More Time](#6-what-id-improve-with-more-time)
7. [Trade-offs Made](#7-trade-offs-made)
8. [AI Tools Used](#8-ai-tools-used)
9. [Architecture Overview](#9-architecture-overview)

---

## 1. How to Run

### Prerequisites

- **Docker** with Docker Compose v2 — [Docker Desktop](https://www.docker.com/products/docker-desktop/) on Windows/macOS, or Docker Engine + the Compose plugin on Linux (`docker-compose-plugin`)

### Start the full stack

From the `clinical-trial-dashboard/` directory:

```bash
# 1. Copy the example env file and adjust values if needed
cp .env.example .env

# 2. Build and start all services
docker compose up --build
```

This starts three services:

| Service    | URL                   | Description                           |
| ---------- | --------------------- | ------------------------------------- |
| `frontend` | http://localhost      | React app served via Nginx            |
| `backend`  | http://localhost:8000 | FastAPI — also at `/docs` for Swagger |
| `postgres` | localhost:5432        | PostgreSQL 16                         |

The backend seeds an `admin` user on first startup. Log in with:

- **Username:** `admin`
- **Password:** `migx123`

### Stop and clean up

```bash
# Stop containers (keeps DB volume)
docker compose down

# Stop and remove the database volume
docker compose down -v
```

### Run locally without Docker (optional)

**Backend:**

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # then edit .env with your values
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

---

## 2. How to Test

### Backend — pytest (21 tests)

```bash
cd clinical-trial-dashboard/backend
pip install -r requirements.txt
pytest tests/ -v
```

Tests run against an **in-memory SQLite** database — no Docker or Postgres required. The `conftest.py` overrides `DATABASE_URL` and the `get_db` dependency so each test run starts from a clean state.

Test coverage:

- `tests/test_auth.py` (9 tests) — login success/failure, session endpoint, logout, schema validation
- `tests/test_participants.py` (12 tests) — full CRUD, unauthenticated access, enum/range/date validation, duplicate `subject_id`

### Frontend — Vitest + React Testing Library (7 tests)

```bash
cd clinical-trial-dashboard/frontend
npm install
npm test
```

Test coverage:

- `LoginPage.test.tsx` — renders form; shows error on bad credentials
- `ParticipantsPage.test.tsx` — renders list, loading skeleton, empty state
- `ProtectedRoute.test.tsx` — redirects unauthenticated users; renders outlet when authenticated

### CI

Both suites run automatically on every push and pull request via `.github/workflows/ci.yml`. The pipeline also runs ESLint and a TypeScript + Vite build check on the frontend.

---

## 3. Authenticate and Call a Protected Route

All participant endpoints require a valid session cookie. Here is a complete `curl` workflow:

### Step 1 — Log in and capture the cookie

```bash
curl -i -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "migx123"}' \
  -c cookies.txt
```

The `-c cookies.txt` flag saves the `access_token` HTTP-only cookie to a file.

Expected response:

```
HTTP/1.1 200 OK
set-cookie: access_token=<jwt>; HttpOnly; Max-Age=3600; Path=/; SameSite=lax
{"message":"ok"}
```

The JWT is stored in the `HttpOnly` cookie — it never appears in the response body. To verify the session, call `/auth/me`:

```bash
curl http://localhost:8000/auth/me -b cookies.txt
# {"username":"admin"}
```

### Step 2 — Call a protected endpoint using the saved cookie

```bash
# List all participants
curl -X GET http://localhost:8000/participants \
  -b cookies.txt

# Create a participant
curl -X POST http://localhost:8000/participants \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "subject_id": "P001",
    "study_group": "treatment",
    "enrollment_date": "2024-01-15",
    "status": "active",
    "age": 42,
    "gender": "F"
  }'
```

### Step 3 — Confirm auth is required (no cookie → 401)

```bash
curl -i http://localhost:8000/participants
# HTTP/1.1 401 Unauthorized
```

### Step 4 — Log out

```bash
curl -X POST http://localhost:8000/auth/logout -b cookies.txt
```

> The Swagger UI at **http://localhost:8000/docs** is another convenient way to explore the API interactively — log in via `POST /auth/login` there and the browser session cookie will be used for subsequent requests in the same tab.

---

## 4. Technologies Used and Why

### Backend

| Technology                       | Why                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| **FastAPI**                      | Automatic OpenAPI docs, Pydantic integration, async-ready, fast to iterate                        |
| **SQLAlchemy** (ORM)             | Mature, typed ORM; decouples DB logic from business code                                          |
| **PostgreSQL**                   | Production-grade relational DB; well-supported in Docker                                          |
| **python-jose + passlib/bcrypt** | JWT creation/validation and secure password hashing with well-established libraries               |
| **pydantic-settings**            | Reads config from `.env` with type validation; same Pydantic model pattern as the rest of the app |
| **pytest + httpx**               | Standard Python testing stack; `TestClient` from FastAPI wraps everything cleanly                 |

### Frontend

| Technology                         | Why                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| **React 19 + TypeScript**          | Familiar, well-supported, required by the brief                                         |
| **Vite**                           | Fast dev server, HMR, optimised build; much faster than CRA                             |
| **React Router v7**                | File-less routing; `<ProtectedRoute>` pattern is clean with it                          |
| **shadcn/ui + Tailwind CSS**       | Accessible, unstyled-first components that are easy to customise; no CSS-in-JS overhead |
| **react-hook-form + Zod**          | Minimal re-renders, co-located validation schemas, inferred TypeScript types            |
| **Recharts**                       | Composable React chart library; good fit for the metric cards                           |
| **Vitest + React Testing Library** | Vite-native test runner; RTL promotes testing behaviour, not implementation             |

### Infrastructure

| Technology         | Why                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Docker Compose** | One command (`docker compose up --build`) to start the whole stack                                         |
| **Nginx**          | Serves the React SPA with `try_files` fallback; proxies `/api/` to the backend (avoids CORS in production) |
| **GitHub Actions** | Declarative CI; runs tests on every push with no additional setup                                          |

---

## 5. What Was Completed and What Was Skipped

### Completed

| #   | Area                                     | Detail                                                                                                                                                         |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅  | **All required functional requirements** | Create, list, retrieve participants; login page; participants table; metrics dashboard; add participant form                                                   |
| ✅  | **Optional: Update/Delete (API only)**   | `PUT /participants/{id}` and `DELETE /participants/{id}` are fully implemented and tested in the backend                                                       |
| ✅  | **JWT auth via HTTP-only cookies**       | Token never touches JS; `ProtectedRoute` guards all pages; 401 mid-session clears auth state and redirects                                                     |
| ✅  | **Input validation — both layers**       | Pydantic schemas on the backend (enum checks, age bounds, date range); Zod schemas on the frontend                                                             |
| ✅  | **Error handling**                       | Global exception handler on the backend; `ApiError` normalisation on the frontend; `ErrorBoundary` for render failures; shadcn `Alert` for user-visible errors |
| ✅  | **Testing**                              | 21 backend tests (auth + participant CRUD + validation), 7 frontend tests (login, list, protected route)                                                       |
| ✅  | **Docker Compose full stack**            | Three services with healthchecks and `condition: service_healthy` startup ordering                                                                             |
| ✅  | **CI pipeline**                          | `.github/workflows/ci.yml` runs pytest + lint + vitest + build on every push                                                                                   |
| ✅  | **OpenAPI docs**                         | Auto-generated at `http://localhost:8000/docs`                                                                                                                 |

### Skipped / Not Implemented

| #   | Item                                    | Reason                                                                                                                                |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| ⏭  | **Update UI**                           | `PUT /participants/{id}` backend route is fully implemented and tested. Frontend edit modal was deprioritised within the time budget. |
| ⏭  | **Pagination on `GET /participants`**   | Returns all rows; acceptable for a prototype. See [improvements](#6-what-id-improve-with-more-time).                                  |
| ⏭  | **DB migrations (Alembic)**             | `Base.metadata.create_all()` used for simplicity. See [trade-offs](#7-trade-offs-made).                                               |
| ⏭  | **Rate limiting on `POST /auth/login`** | No brute-force protection. Would use `slowapi` in production.                                                                         |
| ⏭  | **Type generation from OpenAPI**        | `types/api.ts` is maintained manually. See [improvements](#6-what-id-improve-with-more-time).                                         |

---

## 6. What I'd Improve with More Time

### High priority

- **Update participant UI** — the PUT /participants/{id} backend route is fully implemented and tested; the DELETE route and frontend delete confirmation dialog are also done. The remaining gap is an edit modal on the frontend.
- **Pagination on `GET /participants`** — add `limit`/`offset` query params (or cursor-based pagination) to both the backend route and the frontend table. Essential once participant counts grow.
- **DB migration strategy (Alembic)** — replace `create_all()` with Alembic migrations so schema changes can be applied to production databases safely and rolled back if needed.
- **Auto-generated TypeScript types** — wire up `openapi-typescript` to generate `types/api.ts` from `http://localhost:8000/openapi.json`. Currently the file is maintained manually, which can drift from the backend.

### Medium priority

- **Backend metrics endpoint** (`GET /dashboard/metrics`) — currently the dashboard fetches all participants and aggregates client-side. A dedicated endpoint with SQL `COUNT + GROUP BY` would reduce payload size and scale better.
- **Expanded frontend test coverage** — add tests for `DashboardPage` (metric cards) and `AddParticipantForm` (validation errors, submit success).

### Nice to have

- **Role-based access control** — currently all authenticated users have the same access. A `role` field on `UserModel` and `Depends(require_role("admin"))` would allow read-only vs admin roles.
- **Refresh tokens** — current JWTs expire after 60 minutes. A sliding refresh token pattern would improve UX without sacrificing security.

---

## 7. Trade-offs Made

### `create_all()` instead of Alembic migrations

Schema is created with `Base.metadata.create_all()` on startup. This is fine for a prototype and eliminates the Alembic setup cost, but it can't apply incremental schema changes to a running database. The correct approach for production is Alembic with a migration script per schema change.

### No domain entity layer

A clean-architecture `domain/participant.py` dataclass was considered (and initially scaffolded) but removed. At this scope, the dataclass would be a pure data container with no business rules, adding an ORM → domain → Pydantic mapping step with no benefit. The simpler ORM → Pydantic (`from_attributes=True`) flow was used instead. The domain layer would make sense if the entity gained behaviour (e.g. `participant.withdraw()`) or if services needed to be unit-tested without a database.

### Manual `types/api.ts` instead of generated types

Frontend API types are hand-written to match the backend Pydantic schemas. `openapi-typescript` was planned (see `PLAN.md`) but deprioritised in favour of more functional work. The risk is schema drift; the mitigation is that both layers share the same enum strings (`"treatment"`, `"control"`, etc.) and Zod validates the same rules as Pydantic.

### Client-side metrics aggregation

The metrics dashboard calls `GET /participants` (the same endpoint as the participants list) and aggregates counts with `useMemo` in `useDashboardMetrics.ts`. A dedicated `GET /dashboard/metrics` backend endpoint with `GROUP BY` queries would be more efficient at scale but adds an extra endpoint. For a small trial dataset this trade-off is acceptable.

### Update UI deferred

The `PUT` and `DELETE` backend routes are fully implemented, validated, and tested. The delete confirmation dialog and table action button are wired in the frontend. The remaining gap is an edit modal for the `PUT` route; this was deprioritised within the time budget in favour of error handling, security hardening, and CI.

### HTTP-only cookie vs `Authorization` header

Chose HTTP-only cookies over `localStorage`/`Authorization` header JWT. Cookies are inaccessible to JavaScript (XSS-resistant) and `samesite=lax` provides CSRF protection on cross-site navigations. The trade-off is that the API is harder to test from non-browser clients (you need `-c / -b` with curl). This is mitigated by the Swagger UI being available in development.

---

## 8. AI Tools Used

**Cursor (Claude Sonnet)** was used extensively throughout this project as a coding assistant.

### How it was used

- **Architecture planning** — discussing layer boundaries, auth strategy (HTTP-only cookies vs header tokens), and trade-off documentation.
- **Boilerplate generation** — initial file scaffolding for routers, services, repositories, Pydantic schemas, and React components.
- **Debugging** — diagnosing a `ResponseValidationError` caused by malformed data in the DB (enrollment date `year=22`), tracing a CORS error back to a backend 500, and fixing a SQLite `StaticPool` issue in the test setup.
- **Code review** — reviewing individual files (e.g. `NavBar.tsx`, `useDashboardMetrics.ts`) for improvements in accessibility and performance.
- **Test writing** — generating pytest fixtures (`conftest.py`), auth tests, and validation edge-case tests.
- **Security review** — identifying the 401 mid-session redirect gap and implementing the `setOnUnauthorizedCallback` pattern.
- **Documentation** — drafting this `README.md`.

### What I owned

All architectural decisions (layer boundaries, auth method, DB choice, testing strategy, trade-off reasoning) were mine. Every AI-generated snippet was reviewed, understood, and often revised before being committed. I can explain every part of this codebase.

---

## 9. Architecture Overview

```
┌─────────────────────────────────────────────┐
│              Browser (React SPA)            │
│                                             │
│  LoginPage  ParticipantsPage  DashboardPage │
│       │            │               │        │
│   AuthContext   useParticipants  useDashboard│
│          \          |           /            │
│           ─── api/client.ts ───             │
│              credentials: include           │
└─────────────────────┬───────────────────────┘
                      │  HTTP (cookie)
                      ▼
┌─────────────────────────────────────────────┐
│              Nginx (port 80)                │
│  /           → serve React SPA              │
│  /api/*      → proxy to backend:8000        │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│            FastAPI (port 8000)              │
│                                             │
│  auth_router     participant_router         │
│       │                  │                  │
│  auth_service    participant_service        │
│                          │                  │
│               participant_repository        │
│                          │                  │
│                  SQLAlchemy ORM             │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│            PostgreSQL (port 5432)           │
│   participants table   users table          │
└─────────────────────────────────────────────┘
```

### Backend layers

| Layer          | Files                                                | Responsibility                      |
| -------------- | ---------------------------------------------------- | ----------------------------------- |
| API            | `api/routes/auth_router.py`, `participant_router.py` | HTTP, auth, request validation      |
| Service        | `services/participant_service.py`                    | Business logic, 404 handling        |
| Repository     | `repositories/participant_repository.py`             | SQLAlchemy queries                  |
| Infrastructure | `infrastructure/models.py`, `database.py`            | ORM models, DB session              |
| Domain         | `domain/enums.py`                                    | Shared enum constants               |
| Core           | `core/security.py`                                   | JWT encode/decode, password hashing |

### Frontend layers

| Layer      | Files                                                | Responsibility                                                          |
| ---------- | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| Pages      | `pages/*.tsx`                                        | Route entry points, compose hooks + UI                                  |
| Hooks      | `hooks/useParticipants.ts`, `useDashboardMetrics.ts` | Data fetching, state, memoisation                                       |
| Services   | `services/participantService.ts`                     | API call functions                                                      |
| Client     | `api/client.ts`                                      | `fetch` wrapper, `ApiError` normalisation, 401 callback                 |
| Context    | `context/AuthProvider.tsx`                           | Global auth state, session restoration                                  |
| Components | `components/**`                                      | Reusable UI (`ParticipantTable`, `AddParticipantForm`, `ErrorBoundary`) |
| Types      | `types/api.ts`                                       | Shared TypeScript types matching the backend schema                     |
