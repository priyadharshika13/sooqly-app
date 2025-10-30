# Sooqly Grocery API (FastAPI)

Quick start:
```bash
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```
Seed data:
```bash
python seed.py
```

## Docker (API + Postgres)
```bash
docker compose up --build -d
# API → https://sooqly-app.vercel.app/
```
Set env:
- `DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/dbname`

## Alembic
```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```
