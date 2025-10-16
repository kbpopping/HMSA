insert into clinicians(name, specialty) values
  ('Dr. Ada Okafor', 'General Practice'),
  ('Dr. Kunle Adebayo', 'Cardiology')
on conflict do nothing;

insert into patients(mrn, first_name, last_name, phone, email) values
  ('MRN-0001','John','Doe','08030000000','john@example.com'),
  ('MRN-0002','Mary','Smith','08020000000','mary@example.com')
on conflict do nothing;
