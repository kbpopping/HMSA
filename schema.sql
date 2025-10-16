-- Local Dev Lab - Schema
-- Generated: 2025-09-22

create table if not exists patients (
  id bigserial primary key,
  mrn varchar(64) unique,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text,
  preferred_channel text check (preferred_channel in ('sms','whatsapp','email','voice')) default 'sms',
  consent_reminders boolean default true,
  created_at timestamptz default now()
);

create table if not exists clinicians (
  id bigserial primary key,
  name text not null,
  specialty text
);

create table if not exists appointments (
  id bigserial primary key,
  patient_id bigint references patients(id) on delete cascade,
  clinician_id bigint references clinicians(id),
  start_time timestamptz not null,
  status text check (status in ('booked','confirmed','rescheduled','cancelled','no_show')) default 'booked',
  created_at timestamptz default now()
);

create index if not exists idx_appointments_time on appointments(start_time);
create index if not exists idx_appointments_patient on appointments(patient_id);

create table if not exists notifications (
  id bigserial primary key,
  appointment_id bigint references appointments(id) on delete cascade,
  channel text check (channel in ('sms','whatsapp','email','voice')) not null,
  status text check (status in ('queued','sent','failed')) default 'queued',
  sent_at timestamptz,
  payload_hash text
);
