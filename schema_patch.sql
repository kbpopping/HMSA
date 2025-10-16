-- Schema Patch for Analytics v2
-- Adds clinics dimension and provider fields for notifications

-- Clinics table
create table if not exists clinics (
  id bigserial primary key,
  name text not null unique
);

-- Add optional clinic_id to clinicians (nullable for backward compatibility)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name='clinicians' and column_name='clinic_id'
  ) then
    alter table clinicians add column clinic_id bigint references clinics(id);
  end if;
end$$;

-- Add provider and error columns to notifications for provider breakdown
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name='notifications' and column_name='provider'
  ) then
    alter table notifications add column provider text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_name='notifications' and column_name='error'
  ) then
    alter table notifications add column error text;
  end if;
end$$;

-- Seed a couple of clinics (safe on conflict)
insert into clinics(name) values ('Main Hospital'), ('Annex Clinic')
on conflict do nothing;

-- Optionally attach existing clinicians to the first clinic
update clinicians set clinic_id = (select id from clinics order by id asc limit 1)
where clinic_id is null;
