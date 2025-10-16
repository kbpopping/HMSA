-- Migration 001 — Clinics + Provider columns
-- Run this on your local Postgres (pgAdmin) before using clinic filters or provider breakdown

create table if not exists clinics (
  id bigserial primary key,
  name text not null
);

alter table clinicians
  add column if not exists clinic_id bigint references clinics(id);

alter table notifications
  add column if not exists provider text,          -- e.g., 'twilio', 'infobip', 'mock'
  add column if not exists error text;             -- provider error message/code if failed
