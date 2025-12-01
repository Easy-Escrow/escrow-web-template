# Testing and verification guide

This project includes both Django backend APIs and a React frontend. The steps below help you stand up each part, apply the new escrow features, and validate expected behaviors.

## Prerequisites
- Python 3.11+ and Node 18+
- A virtual environment for Python and `npm` for frontend deps
- For database-backed runs, PostgreSQL/Redis via Docker Compose, or use SQLite for quick checks

## Backend setup
1. Create and activate a virtualenv, then install dependencies:
   ```bash
   python -m venv .venv && source .venv/bin/activate
   make install-backend
   ```
2. Copy configuration:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Apply migrations (SQLite shortcut shown; use your DB env otherwise):
   ```bash
   USE_SQLITE=1 python backend/manage.py migrate
   ```
4. Run the API locally:
   ```bash
   USE_SQLITE=1 python backend/manage.py runserver
   ```

## Backend automated tests
Run the escrow suite (covers escrow creation, party CRUD/filtering, broker invitation acceptance/decline, commission share validation, and locking):
```bash
USE_SQLITE=1 python backend/manage.py test escrows
```

## Manual backend checks
With the dev server running and an authenticated user:
- **Create escrow**: `POST /escrows/` to get a draft escrow with an initial commission pool and listing-broker representation.
- **Manage parties**: `GET/POST/PATCH/DELETE /escrows/{id}/parties/` with optional `?role=` filter.
- **Invite co-brokers**: `POST /escrows/{id}/brokers/` to send invites; invitees `PATCH` their broker representation to accept/decline.
- **Commission pools**: `GET/PATCH /escrows/{id}/commission-pool/` to adjust totals/shares; `POST /escrows/{id}/commission-pool/lock/` to freeze allocations (further edits should return 400).

## Frontend setup and smoke tests
1. Install deps:
   ```bash
   cd frontend
   npm install
   ```
2. Start Vite dev server (defaults to `http://localhost:5173` and proxies API calls to `VITE_API_URL`):
   ```bash
   npm run dev
   ```
3. Navigate to broker/co-broker flows:
   - `/broker/escrows` – list escrows for the logged-in broker.
   - `/broker/escrows/new` – creation wizard; after submitting, continue in the workspace to add parties, invite co-brokers, and edit commission pools.
   - `/broker/escrows/:id` – workspace for an existing escrow.
   - `/co-broker/invitations` – review and respond to incoming invitations.

These pages use React Query to refetch after mutations, so changes should appear immediately after each action.
