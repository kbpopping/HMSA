# Local Dev Lab Pack — Automated Patient Communication & Appointment System

Run the MVP **fully on your laptop** using Docker.

## What's inside
- `docker-compose.yml` — Postgres, n8n, pgAdmin, MailHog
- `.env.example` — local credentials template
- `schema.sql` / `seed.sql` — tables + demo data
- `n8n_workflows/*.json` — importable workflows (book, confirm, reminders)
- `ui/index.html` — simple booking form that POSTs to n8n webhook
- `Hospital_MVP_Local.postman_collection.json` — Postman collection
- `scripts/*.sh` — curl helpers

## Prereqs
- Docker installed
- Ports free: 5432, 5678, 8081, 8025

## 1) Start services
```bash
cp .env.example .env
docker compose up -d
```

## 2) Create tables + seed
Open pgAdmin at **http://localhost:8081** (login from `.env`), connect to server:
- Host: `postgres`
- User/Pass: from `.env`
- DB: `hospitaldb`

Run `schema.sql` then `seed.sql`.

## 3) Import workflows
- Open n8n: **http://localhost:5678**
- Create admin account
- **Settings → Credentials**: create **Local Postgres** credential (Host `postgres`, DB/User/Pass from `.env`).
- **Workflows → Import**: import all JSON files in `n8n_workflows/`.
- (Optional) Activate reminders flow.

## 4) Test quickly
- Open `ui/index.html` and book an appointment **3–4 minutes from now**.
- Watch `appointments` table update.
- The reminders flow (every minute) writes rows to `notifications`.

Or use curl:
```bash
bash scripts/book.sh
bash scripts/confirm.sh
```

## 5) Mock email/SMS
- MailHog Web UI: **http://localhost:8025**
- Replace the "Simulate Send" node with a real provider node later.

## 6) Dev-only
- Do **not** use real patient data here.
- This pack is to learn, demo, and iterate.
