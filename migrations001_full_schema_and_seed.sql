BEGIN;

-- 1) Ensure UUIDs are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2) Clean duplicates in hospitals (if any)
DELETE FROM hospitals h
USING hospitals h2
WHERE h.name = h2.name
  AND h.ctid > h2.ctid;

-- 3) Add unique constraint on hospital names
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hospitals_name_key'
  ) THEN
    ALTER TABLE hospitals
    ADD CONSTRAINT hospitals_name_key UNIQUE (name);
  END IF;
END $$;

-- 4) Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  country    TEXT,
  timezone   TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Patients
CREATE TABLE IF NOT EXISTS patients (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  date_of_birth DATE,
  hospital_id  UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6) Clinicians
CREATE TABLE IF NOT EXISTS clinicians (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  specialty    TEXT,
  email        TEXT,   -- nullable (some clinicians may not have email)
  phone        TEXT,
  hospital_id  UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7) Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id  UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  patient_id   UUID REFERENCES patients(id) ON DELETE SET NULL,
  clinician_id UUID REFERENCES clinicians(id) ON DELETE SET NULL,
  start_time   TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL DEFAULT 'booked',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8) Touch trigger for updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers if not already present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'touch_hospitals') THEN
    CREATE TRIGGER touch_hospitals BEFORE UPDATE ON hospitals
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'touch_patients') THEN
    CREATE TRIGGER touch_patients BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'touch_clinicians') THEN
    CREATE TRIGGER touch_clinicians BEFORE UPDATE ON clinicians
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'touch_appointments') THEN
    CREATE TRIGGER touch_appointments BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
END $$;

-- 9) Seed hospitals
INSERT INTO hospitals (name, country, timezone)
VALUES
('Demo General Hospital','NG','Africa/Lagos'),
('Lakeside Clinic','NG','Africa/Lagos')
ON CONFLICT (name) DO NOTHING;

-- 10) Seed patients
WITH h1 AS (SELECT id FROM hospitals WHERE name='Demo General Hospital' LIMIT 1),
     h2 AS (SELECT id FROM hospitals WHERE name='Lakeside Clinic' LIMIT 1)
INSERT INTO patients (hospital_id, first_name, last_name, phone, email, date_of_birth)
VALUES
((SELECT id FROM h1),'John','Doe','+2348012345678','john.doe@example.com','1985-06-15'),
((SELECT id FROM h1),'Alice','Smith','+2348012345671','alice.smith@example.com','1990-02-15'),
((SELECT id FROM h2),'Grace','Adebayo','+2348012345673','grace.adebayo@example.com','1995-11-03')
ON CONFLICT DO NOTHING;

-- 11) Seed clinicians (with phone + optional email)
WITH h1 AS (SELECT id FROM hospitals WHERE name='Demo General Hospital' LIMIT 1),
     h2 AS (SELECT id FROM hospitals WHERE name='Lakeside Clinic' LIMIT 1)
INSERT INTO clinicians (hospital_id, name, specialty, email, phone) VALUES
((SELECT id FROM h1),'Dr. Ada Okafor','Cardiology','ada.okafor@example.com','+2348011111111'),
((SELECT id FROM h1),'Dr. Chika Obi','Pediatrics','chika.obi@example.com','+2348011111112'),
((SELECT id FROM h2),'Dr. Emeka Nwosu','Dermatology','emeka.nwosu@example.com','+2348011111113'),
((SELECT id FROM h2),'Dr. Amina Bello','Neurology','amina.bello@example.com','+2348011111114'),
((SELECT id FROM h2),'Dr. Segun Adeleke','Orthopedics','segun.adeleke@example.com','+2348011111115'),
((SELECT id FROM h1),'Dr. Ngozi Ume','General Surgery',NULL,'+2348011111116') -- exempted email
ON CONFLICT DO NOTHING;

-- 12) Seed appointments
WITH h1 AS (SELECT id FROM hospitals WHERE name='Demo General Hospital' LIMIT 1),
     h2 AS (SELECT id FROM hospitals WHERE name='Lakeside Clinic' LIMIT 1)
INSERT INTO appointments (hospital_id, patient_id, clinician_id, start_time, status) VALUES
(
 (SELECT id FROM h1),
 (SELECT p.id FROM patients p JOIN hospitals h ON h.id=p.hospital_id WHERE p.email='john.doe@example.com' AND h.name='Demo General Hospital'),
 (SELECT c.id FROM clinicians c JOIN hospitals h ON h.id=c.hospital_id WHERE c.name='Dr. Ada Okafor' AND h.name='Demo General Hospital'),
 now() - interval '3 minutes','booked'
),
(
 (SELECT id FROM h2),
 (SELECT p.id FROM patients p JOIN hospitals h ON h.id=p.hospital_id WHERE p.email='grace.adebayo@example.com' AND h.name='Lakeside Clinic'),
 (SELECT c.id FROM clinicians c JOIN hospitals h ON h.id=c.hospital_id WHERE c.name='Dr. Chika Obi' AND h.name='Demo General Hospital' LIMIT 1),
 now() + interval '15 minutes','booked'
)
ON CONFLICT DO NOTHING;

COMMIT;
