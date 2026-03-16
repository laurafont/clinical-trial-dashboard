# PLAN

---

## 1. Final Architecture Overview

High-level system:

                   ┌───────────────────────┐
                   │       React App       │
                   │   (TypeScript + UI)   │
                   │  shadcn components    │
                   └───────────┬───────────┘
                               │
                               │ Typed API Client
                               │ (OpenAPI generated)
                               ▼
                   ┌───────────────────────┐
                   │       FastAPI API     │
                   │     Controller Layer  │
                   └───────────┬───────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │      Service Layer    │
                   │    Business Logic     │
                   └───────────┬───────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │    Repository Layer   │
                   │   Data Access Logic   │
                   └───────────┬───────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │      SQLAlchemy ORM   │
                   └───────────┬───────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │      PostgreSQL DB    │
                   └───────────────────────┘

**Key goals achieved:**

- Clean architecture
- SOLID principles
- Typed API contract
- Separation of concerns
- Containerized environment

---

## 2. Backend Architecture

### Layers

**API → Services → Repositories → Database**

### Responsibilities

| Layer          | Responsibility                  |
| -------------- | ------------------------------- |
| API            | HTTP requests, auth, validation |
| Service        | Business logic                  |
| Repository     | Database operations             |
| Infrastructure | ORM + DB config                 |

### Backend Folder Structure

```
backend
├── app
│   ├── api
│   │   └── routes
│   │       ├── auth_router.py
│   │       └── participant_router.py
│   ├── services
│   │   └── participant_service.py
│   ├── repositories
│   │   └── participant_repository.py
│   ├── schemas
│   │   ├── participant_schema.py
│   │   └── auth_schema.py
│   ├── domain
│   │   └── participant.py
│   ├── infrastructure
│   │   ├── database.py
│   │   └── models.py
│   ├── core
│   │   └── security.py
│   └── main.py
├── tests
│   └── test_participants.py
├── Dockerfile
└── requirements.txt
```

### Backend Main Features

**Implement:**

- `POST /auth/login`
- `GET /participants`
- `POST /participants`
- `GET /participants/{id}`

**Optional (if time):**

- `PUT /participants/{id}`
- `DELETE /participants/{id}`

### Authentication

- Use **JWT authentication** with **HTTP-only cookies** (no token in frontend JS or `localStorage`).
- **Libraries:** `python-jose`, `Passlib`.
- **Flow:** Login → backend sets HTTP-only cookie with JWT → browser sends cookie on subsequent requests → protected routes read token from cookie via `get_current_user`.
- **Backend:** `POST /auth/login` sets cookie (`httponly`, `secure` in production, `samesite=lax`). The login response body **does not** include the JWT (cookie only). `get_current_user` reads JWT from `request.cookies` only. `POST /auth/logout` clears the cookie; `GET /auth/me` (protected) returns current user for session hydration on mount.
- **Frontend:** All API requests use `credentials: "include"`. Auth state is `isAuthenticated` only; logout via `POST /auth/logout`; on mount call `GET /auth/me` to restore session.
- **FastAPI:** `Depends(get_current_user)` on protected routes.

---

## 3. Database

- Use **PostgreSQL** via Docker.
- **ORM:** SQLAlchemy.
- Keep setup simple: `Base.metadata.create_all()`.
- Skip migrations to save time.

---

## 4. Frontend Architecture

Built with:

- React
- TypeScript
- Vite
- React Router
- Context API
- shadcn/ui
- **Route paths** — Centralized in `constants/routes.ts` (`ROUTES`) so links, redirects, and route config stay in sync.

---

## 5. Frontend Folder Structure

```
frontend
├── src
│   ├── api
│   │   └── client.ts
│   ├── constants
│   │   └── routes.ts
│   ├── types
│   │   └── api.ts
│   ├── services
│   │   └── participantService.ts
│   ├── hooks
│   │   └── useParticipants.ts
│   ├── context
│   │   └── AuthContext.tsx
│   ├── components
│   │   ├── participants
│   │   │   ├── ParticipantTable.tsx
│   │   │   └── AddParticipantForm.tsx
│   │   └── layout
│   │       └── Navbar.tsx
│   ├── ui
│   │   └── (shadcn components)
│   ├── pages
│   │   ├── LoginPage.tsx
│   │   ├── ParticipantsPage.tsx
│   │   └── DashboardPage.tsx
│   ├── tests
│   │   └── LoginPage.test.tsx
│   ├── App.tsx
│   └── main.tsx
├── Dockerfile
└── package.json
```

---

## 6. shadcn Component Strategy

- Use **shadcn/ui** components inside `src/ui`.
- **Examples:** `ui/button.tsx`, `ui/input.tsx`, `ui/table.tsx`, `ui/card.tsx`.
- Keep your own components in `components/` (e.g. `components/participants/ParticipantTable.tsx`).
- This keeps UI architecture clear.

---

## 7. Type-Safe API Integration

- Generate types from FastAPI OpenAPI.
- **Tools:** `openapi-typescript`, `openapi-fetch`.
- **Workflow:** Backend exposes `/openapi.json` → Generate TypeScript types → Typed API client.
- **Result:** `api.GET("/participants")` is fully typed.

---

## 8. Docker Setup

- Use **Docker** and **Docker Compose**.
- **Services:** `frontend`, `backend`, `postgres`.
- **Files:** `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`.

---

## 9. Testing Strategy

### Backend

- Use **pytest**.
- Test: create participant, get participants.

### Frontend

- Use **Jest** + **React Testing Library**.
- Test: login page renders, participants list loads.
- Even one test each is enough.

---

## 10. Metrics Dashboard

- Simple aggregated metrics only.
- **Examples:** Total participants, Treatment vs Control, Active vs Completed.
- Display with cards or small charts.
- No heavy analytics required.

---

## 11. Input Validation (To Do)

- **Frontend:** Add input validation for login (and other forms). Beyond HTML5 `required`, consider length limits, format rules, and clear error messages; optional: a validation library (e.g. Zod, React Hook Form).
- **Backend:** Add validation to `LoginRequest` and other request schemas (e.g. Pydantic validators: min/max length, non-empty strings, format). Validate on both frontend and backend so bad data is rejected early and consistently.

---

## 12. Backend Dashboard Metrics Endpoint

- **Idea:** Instead of the Dashboard fetching the full participant list (`GET /participants`) and computing counts in the frontend, add a dedicated **metrics/summary endpoint** (e.g. `GET /dashboard/metrics` or `GET /participants/metrics`) that returns pre-aggregated counts.
- **Backend:** One (or a few) SQL queries with `COUNT` and `GROUP BY` (e.g. by `study_group`, `status`, `gender`). Return a small JSON payload (total, treatment/control, active/completed/withdrawn, gender breakdown).
- **Frontend:** A small API function + hook that fetches this endpoint; Dashboard page uses it instead of `useParticipants()` + client-side `useDashboardMetrics(participants)`.
- **Benefits:** Smaller payload, faster load, scales better with many participants; DB does aggregation in one pass. Keep the existing client-side metrics hook for cases where the full list is already in memory (e.g. cached from the Participants page).
