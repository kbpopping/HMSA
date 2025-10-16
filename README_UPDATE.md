# Analytics Dashboard Add‑On v2

Features added:
- `/metrics?start=YYYY-MM-DD&end=YYYY-MM-DD&clinician_id=...&clinic_id=...` filters
- Provider breakdown by channel & provider (sent vs failed)
- Doctor/clinic filters (requires migration below for clinic support)
- Lightweight auth via header `X-DASH-TOKEN` (check against n8n env var `DASH_TOKEN`)
- CSV export from the dashboard

## 1) Run migration (optional but recommended)
In pgAdmin, execute:
- `migration_001_add_clinics_and_provider.sql`

This adds:
- `clinics` table and `clinicians.clinic_id`
- `notifications.provider` and `notifications.error`

## 2) Set token in n8n
Add environment variable for n8n (e.g., in your docker-compose `n8n` service):
```
- DASH_TOKEN=your_secret_here
```
Restart n8n. The dashboard will send this token in header `X-DASH-TOKEN`.

## 3) Import workflow
In n8n (http://localhost:5678) → **Workflows → Import** → `workflow_metrics_v2.json`  
Ensure **Local Postgres** credential is configured.

## 4) Open dashboard
Load `dashboard_v2.html` in your browser. Enter the token (stored in localStorage), set filters, and click **Apply**.

## 5) Notes
- If you haven’t run the migration, `clinic_id` filter won’t match anything (no column/values). Run it to enable clinic filters and provider breakdown per vendor.
- Provider breakdown reads from `notifications` where you should start setting `provider` and `status='sent'|'failed'` in your reminder flows.
- CSV export bundles timeseries and provider tables into a single file.
