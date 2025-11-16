.PHONY: install-backend install-frontend dev-up dev-down test-backend lint-frontend format

install-backend:
	python -m pip install -r backend/requirements.txt

install-frontend:
	cd frontend && npm install

dev-up:
	docker compose up --build

dev-down:
	docker compose down

test-backend:
	python backend/manage.py test

lint-frontend:
	cd frontend && npm run lint

format:
	pre-commit run --all-files
