# Escrow Web Template

A batteries-included starter kit for escrow-focused products. It provides a Django REST backend, a React + Vite frontend, and shared tooling so teams can ship quickly.

## Project structure

```
backend/   # Django project configured for PostgreSQL, DRF, JWT, and CORS
frontend/  # React + Vite app with TypeScript, ESLint, Prettier, Router, Query, Axios
.github/   # CI pipelines
```

## Backend quick start

```bash
python -m venv .venv && source .venv/bin/activate
make install-backend
cp backend/.env.example backend/.env
python backend/manage.py migrate
python backend/manage.py runserver
```

The backend exposes a `/health/` route for smoke testing and uses REST Framework + SimpleJWT for API authentication. Environment configuration lives in `backend/.env` and is loaded automatically.

## Frontend quick start

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server listens on port `5173` and proxies API requests via the `VITE_API_URL` environment variable (defaults to `http://localhost:8000`). React Router, TanStack Query, and Axios are pre-wired to call the backend health endpoint.

## Environment variables

Create a root `.env` file (copy from `.env.example`) for Docker Compose, and a `backend/.env` file (copy from `backend/.env.example`) for Django-specific settings.

| Variable | Description |
| --- | --- |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | PostgreSQL credentials used by Docker and Django |
| `POSTGRES_HOST`, `POSTGRES_PORT` | Database location (defaults to `postgres:5432` in Compose) |
| `DJANGO_SECRET_KEY` | Secret key for cryptographic signing |
| `DJANGO_DEBUG` | Set to `1` to enable debug mode locally |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated list of allowed hosts |
| `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` | Origins permitted for browser access |
| `JWT_ACCESS_MINUTES`, `JWT_REFRESH_DAYS`, `JWT_SIGNING_KEY` | SimpleJWT token tuning |
| `REDIS_URL` | Redis connection string shared by workers/services |
| `VITE_API_URL` | Base URL for the frontend API client |

## Docker Compose workflow

```bash
cp .env.example .env
cp backend/.env.example backend/.env
make dev-up
```

Services:

- `postgres`: PostgreSQL 16 with a persistent volume
- `redis`: Redis 7 for caching/background jobs
- `web`: Django development server running on `localhost:8000`
- `frontend`: Vite dev server on `localhost:5173`

Shut everything down with `make dev-down`.

## Tooling & automation

- **Makefile** shortcuts for installing dependencies, running tests, and formatting via `pre-commit`.
- **pre-commit** enforces Black, isort, Ruff, and Prettier across the repo. Install with `pip install pre-commit && pre-commit install`.
- **GitHub Actions** workflow (`.github/workflows/ci.yml`) runs backend checks plus frontend lint/build on every push and pull request.

## Testing & linting

- `make test-backend` – Django test runner
- `make lint-frontend` – ESLint for React code
- `cd frontend && npm run build` – Type-safe production build via Vite

These commands are also executed inside CI to keep both apps green from day one.
