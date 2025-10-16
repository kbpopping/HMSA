// server.js (DB-config safe + clearer debug)
// -------------------------------------------------------
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { randomUUID } = require('crypto');
const path = require('path');

const app = express();

// ====== ENV ======
const {
  DATABASE_URL,                  // optional if you use discrete PG* vars
  PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, // optional discrete vars

  JWT_SECRET = 'dev_secret_change_me',
  ACCESS_TTL = '15m',
  REFRESH_TTL = '7d',
  PORT = 8080,
  CORS_ORIGIN = 'http://localhost:5173',
  SECURE_COOKIES = 'false',

  // Seeder defaults (can override in .env)
  SUPER_ADMIN_EMAIL = 'superadmin@demo.com',
  SUPER_ADMIN_PASSWORD = 'demo123!',
  DEMO_HOSPITAL_NAME = 'Demo General Hospital',
  DEMO_HOSPITAL_COUNTRY = 'NG',
  DEMO_HOSPITAL_TZ = 'Africa/Lagos',
} = process.env;

// ---- Build DB config (DATABASE_URL or discrete PG* vars) ----
function buildDbConfig() {
  if (DATABASE_URL && DATABASE_URL.trim()) {
    return { connectionString: DATABASE_URL.trim(), max: 10 };
  }
  // allow discrete config
  if (PGHOST && PGUSER && PGDATABASE) {
    return {
      host: PGHOST,
      port: PGPORT ? Number(PGPORT) : 5432,
      user: PGUSER,
      password: PGPASSWORD,
      database: PGDATABASE,
      max: 10,
    };
  }
  throw new Error(
    'No database configuration found. Set DATABASE_URL, or PGHOST/PGUSER/PGDATABASE (and optionally PGPORT/PGPASSWORD) in your .env'
  );
}

let dbConfig;
try {
  dbConfig = buildDbConfig();
} catch (e) {
  console.error('❌ DB CONFIG ERROR:', e.message);
  // Don’t start the server if DB config is missing
  process.exit(1);
}

const pool = new Pool(dbConfig);

// ====== MIDDLEWARE ======
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CORS_ORIGIN.split(',').map(s => s.trim()),
    credentials: true,
  })
);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// ====== JWT HELPERS ======
function signAccess(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
}
function signRefresh(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TTL });
}
function setTokenCookies(res, access, refresh) {
  const secure = SECURE_COOKIES === 'true';
  res.cookie('access_token', access, {
    httpOnly: true, sameSite: 'lax', secure, path: '/',
  });
  res.cookie('refresh_token', refresh, {
    httpOnly: true, sameSite: 'lax', secure, path: '/api/auth/refresh',
  });
}
function clearTokenCookies(res) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
}

async function auth(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ error: 'Unauthenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { sub, role, hospital_id? }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid/expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

function ensureHospitalScope(req, res, next) {
  const paramHid = req.params.id;
  if (req.user.role === 'super_admin') return next();
  if (!req.user.hospital_id) return res.status(403).json({ error: 'No hospital scope' });
  if (paramHid && req.user.hospital_id !== paramHid) {
    return res.status(403).json({ error: 'Cross-tenant access denied' });
  }
  next();
}

// ====== BASIC/DEBUG ROUTES ======
app.get('/', (req, res) => res.redirect('/login.html'));
app.get('/health', (req, res) => res.json({ ok: true }));

// Safe DB config peek (no secrets)
app.get('/debug/db-config', (req, res) => {
  const safe = DATABASE_URL
    ? { using: 'DATABASE_URL', hasConnectionString: true }
    : {
        using: 'discrete',
        host: PGHOST || null,
        port: PGPORT || null,
        user: PGUSER || null,
        database: PGDATABASE || null,
      };
  res.json(safe);
});

// DB ping
app.get('/debug/ping-db', async (req, res) => {
  try {
    const r = await pool.query('SELECT 1 as ok');
    res.json({ ok: r.rows[0].ok === 1 });
  } catch (e) {
    console.error('PING-DB ERROR:', e);
    res.status(500).json({ error: e.message });
  }
});

// Inspect a user (DEV ONLY)
app.get('/debug/user', async (req, res) => {
  try {
    const email = (req.query.email || '').toString();
    const q = `SELECT id, email, role, is_active, hospital_id, password_hash, length(password_hash) AS hash_len
               FROM hospital_users WHERE email = $1`;
    const { rows } = await pool.query(q, [email]);
    res.json(rows[0] || null);
  } catch (e) {
    console.error('DEBUG USER ERROR:', e);
    res.status(500).json({ error: e.message });
  }
});

// ====== AUTH ======

// POST /api/auth/login {email, password}
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const q = `SELECT id, hospital_id, role, password_hash, is_active FROM hospital_users WHERE email=$1`;
    const { rows } = await pool.query(q, [email]);
    const u = rows[0];

    if (!u) {
      console.error('LOGIN: user not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!u.is_active) {
      console.error('LOGIN: user inactive:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!u.password_hash) {
      console.error('LOGIN: no password_hash in DB for:', email);
      return res.status(500).json({ error: 'User has no password hash' });
    }

    let ok = false;
    try {
      ok = await bcrypt.compare(password, u.password_hash);
    } catch (cmpErr) {
      console.error('LOGIN: bcrypt.compare threw:', cmpErr);
      return res.status(500).json({ error: 'Password hash invalid on server' });
    }
    if (!ok) {
      console.error('LOGIN: bad password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const access = signAccess({ sub: u.id, role: u.role, hospital_id: u.hospital_id || null });
    const refresh = signRefresh({ sub: u.id, role: u.role, hospital_id: u.hospital_id || null });

    await pool.query('UPDATE hospital_users SET last_login = now() WHERE id = $1', [u.id]);

    setTokenCookies(res, access, refresh);
    res.json({ ok: true, role: u.role, hospital_id: u.hospital_id || null });
  } catch (e) {
    console.error('LOGIN ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const access = signAccess({ sub: payload.sub, role: payload.role, hospital_id: payload.hospital_id || null });
    const refresh = signRefresh({ sub: payload.sub, role: payload.role, hospital_id: payload.hospital_id || null });
    setTokenCookies(res, access, refresh);
    res.json({ ok: true });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  clearTokenCookies(res);
  res.json({ ok: true });
});

// ====== SUPER ADMIN ======

// GET /api/super/hospitals
app.get('/api/super/hospitals', auth, requireRole('super_admin'), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const offset = parseInt(req.query.offset || '0', 10);
    const q = `SELECT id, name, country, timezone, created_at
               FROM hospitals ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const { rows } = await pool.query(q, [limit, offset]);
    res.json(rows);
  } catch (e) {
    console.error('LIST HOSPITALS ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/super/hospitals {name,country,timezone, adminEmail, adminPassword}
app.post('/api/super/hospitals', auth, requireRole('super_admin'), async (req, res) => {
  const { name, country, timezone, adminEmail, adminPassword } = req.body || {};
  if (!name || !adminEmail || !adminPassword) {
    return res.status(400).json({ error: 'name, adminEmail, adminPassword required' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const h = await client.query(
      `INSERT INTO hospitals (name, country, timezone) VALUES ($1,$2,$3) RETURNING id`,
      [name, country || null, timezone || 'UTC']
    );
    const hospitalId = h.rows[0].id;
    const hash = await bcrypt.hash(adminPassword, 12);
    await client.query(
      `INSERT INTO hospital_users (hospital_id, email, password_hash, role, is_active)
       VALUES ($1,$2,$3,'hospital_admin', true)`,
      [hospitalId, adminEmail, hash]
    );
    await client.query('COMMIT');
    res.status(201).json({ id: hospitalId, name });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('CREATE HOSPITAL ERROR:', e);
    res.status(400).json({ error: e.message });
  } finally {
    client.release();
  }
});

// POST /api/super/impersonate {hospital_id}
app.post('/api/super/impersonate', auth, requireRole('super_admin'), async (req, res) => {
  try {
    const { hospital_id } = req.body || {};
    if (!hospital_id) return res.status(400).json({ error: 'hospital_id required' });
    const { rowCount } = await pool.query(`SELECT 1 FROM hospitals WHERE id = $1`, [hospital_id]);
    if (!rowCount) return res.status(404).json({ error: 'Hospital not found' });

    const access = signAccess({ sub: req.user.sub, role: 'hospital_admin', hospital_id });
    const refresh = signRefresh({ sub: req.user.sub, role: 'hospital_admin', hospital_id });
    setTokenCookies(res, access, refresh);
    res.json({ ok: true, hospital_id });
  } catch (e) {
    console.error('IMPERSONATE ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ====== HOSPITAL ADMIN (scoped) ======

// GET /api/hospitals/me
app.get('/api/hospitals/me', auth, requireRole('hospital_admin', 'super_admin'), async (req, res) => {
  try {
    const hid = req.user.role === 'super_admin' ? req.query.id : req.user.hospital_id;
    if (!hid) return res.status(400).json({ error: 'No hospital scope' });
    const { rows } = await pool.query(
      `SELECT id, name, country, timezone, created_at FROM hospitals WHERE id = $1`, [hid]
    );
    res.json(rows[0] || null);
  } catch (e) {
    console.error('ME ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/hospitals/:id/metrics
app.get('/api/hospitals/:id/metrics', auth, requireRole('hospital_admin', 'super_admin'), ensureHospitalScope, async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;
    const startTs = start ? new Date(start) : new Date(Date.now() - 7 * 86400_000);
    const endTs = end ? new Date(end) : new Date();

    const q1 = `SELECT COUNT(*)::int AS total
                FROM appointments
                WHERE hospital_id = $1 AND start_time BETWEEN $2 AND $3`;

    const q2 = `SELECT status, COUNT(*)::int AS count
                FROM appointments
                WHERE hospital_id = $1 AND start_time BETWEEN $2 AND $3
                GROUP BY status`;

    const q3 = `SELECT channel, provider, status, COUNT(*)::int AS sends
                FROM notifications
                WHERE hospital_id = $1 AND sent_at BETWEEN $2 AND $3
                GROUP BY channel, provider, status
                ORDER BY sends DESC`;

    const [a, b, c] = await Promise.all([
      pool.query(q1, [id, startTs, endTs]),
      pool.query(q2, [id, startTs, endTs]),
      pool.query(q3, [id, startTs, endTs]),
    ]);

    res.json({ range: { start: startTs, end: endTs }, totalAppointments: a.rows[0].total, byStatus: b.rows, notifBreakdown: c.rows });
  } catch (e) {
    console.error('METRICS ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ====== Patients ======
app.get('/api/hospitals/:id/patients', auth, requireRole('hospital_admin', 'super_admin'), ensureHospitalScope, async (req, res) => {
  try {
    const { id } = req.params;
    const search = (req.query.search || '').toString();
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(parseInt(req.query.pageSize || '20', 10), 100);
    const offset = (page - 1) * pageSize;

    const q = `
      SELECT id, first_name, last_name, email, phone, mrn, created_at
      FROM patients
      WHERE hospital_id = $1
        AND ($2 = '' OR first_name ILIKE '%'||$2||'%' OR last_name ILIKE '%'||$2||'%' OR email ILIKE '%'||$2||'%' OR mrn ILIKE '%'||$2||'%')
      ORDER BY id DESC
      LIMIT $3 OFFSET $4
    `;
    const { rows } = await pool.query(q, [id, search, pageSize, offset]);
    res.json(rows);
  } catch (e) {
    console.error('PATIENTS LIST ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/hospitals/:id/patients', auth, requireRole('hospital_admin', 'super_admin'), ensureHospitalScope, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, date_of_birth } = req.body || {};
    if (!first_name || !last_name) return res.status(400).json({ error: 'first_name and last_name required' });
    const q = `
      INSERT INTO patients (hospital_id, first_name, last_name, email, phone, date_of_birth)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id, mrn
    `;
    const { rows } = await pool.query(q, [id, first_name, last_name, email || null, phone || null, date_of_birth || null]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('PATIENT CREATE ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ====== Clinicians ======
app.get('/api/hospitals/:id/clinicians', auth, requireRole('hospital_admin', 'super_admin'), ensureHospitalScope, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT id, name, specialty, email, phone, created_at
       FROM clinicians
       WHERE hospital_id = $1
       ORDER BY name ASC`, [id]
    );
    res.json(rows);
  } catch (e) {
    console.error('CLINICIANS LIST ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/hospitals/:id/clinicians', auth, requireRole('hospital_admin', 'super_admin'), ensureHospitalScope, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, email, phone } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const q = `
      INSERT INTO clinicians (hospital_id, name, specialty, email, phone)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (hospital_id, email) DO NOTHING
      RETURNING id
    `;
    const { rows } = await pool.query(q, [id, name, specialty || null, email || null, phone || null]);
    res.status(201).json(rows[0] || { created: false, reason: 'duplicate (hospital_id,email)' });
  } catch (e) {
    console.error('CLINICIAN CREATE ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ====== Templates ======
app.get('/api/hospitals/:id/templates', auth, requireRole('hospital_admin', 'super_admin'), ensureHospitalScope, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT id, name, channel, subject, body_text, is_active, updated_at
       FROM message_templates
       WHERE hospital_id = $1
       ORDER BY name ASC`, [id]
    );
    res.json(rows);
  } catch (e) {
    console.error('TEMPLATES LIST ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/hospitals/:id/templates', auth, requireRole('hospital_admin', 'super_admin'), ensureHospitalScope, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, channel, subject, body_text, is_active } = req.body || {};
    if (!name || !channel || !body_text) return res.status(400).json({ error: 'name, channel, body_text required' });
    const q = `
      INSERT INTO message_templates (hospital_id, name, channel, subject, body_text, is_active)
      VALUES ($1,$2,$3,$4,$5,COALESCE($6, TRUE))
      ON CONFLICT (hospital_id, name, channel)
      DO UPDATE SET subject = EXCLUDED.subject, body_text = EXCLUDED.body_text, is_active = EXCLUDED.is_active, updated_at = now()
      RETURNING id
    `;
    const { rows } = await pool.query(q, [id, name, channel, subject || null, body_text, is_active]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('TEMPLATE UPSERT ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ====== Contact Preferences ======
app.get('/api/hospitals/:id/contact-preferences', auth, requireRole('hospital_admin', 'super_admin'), ensureHospitalScope, async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.query.patient_id ? parseInt(req.query.patient_id, 10) : null;
    let q = `SELECT id, patient_id, channel, is_opt_in, updated_at FROM contact_preferences WHERE hospital_id = $1`;
    const params = [id];
    if (patientId) { q += ` AND patient_id = $2`; params.push(patientId); }
    q += ` ORDER BY patient_id ASC, channel ASC`;
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (e) {
    console.error('CP LIST ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/hospitals/:id/contact-preferences', auth, requireRole('hospital_admin', 'super_admin'), ensureHospitalScope, async (req, res) => {
  try {
    const { id } = req.params;
    const { patient_id, channel, is_opt_in } = req.body || {};
    if (!patient_id || !channel) return res.status(400).json({ error: 'patient_id and channel required' });
    const q = `
      INSERT INTO contact_preferences (hospital_id, patient_id, channel, is_opt_in)
      VALUES ($1,$2,$3,COALESCE($4, TRUE))
      ON CONFLICT (hospital_id, patient_id, channel)
      DO UPDATE SET is_opt_in = EXCLUDED.is_opt_in, updated_at = now()
      RETURNING id, is_opt_in
    `;
    const { rows } = await pool.query(q, [id, patient_id, channel, is_opt_in]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('CP UPSERT ERROR:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ====== ERROR HANDLER ======
app.use((err, req, res, next) => {
  console.error('UNCAUGHT ERROR:', err);
  res.status(500).json({ error: 'Server error' });
});

// ====== BOOTSTRAP: DB ping, seed, then start ======
async function ensureDemoHospitalAndSuperAdmin() {
  try {
    // make sure DB reachable first
    await pool.query('SELECT 1');

    // Ensure Demo hospital exists (idempotent on name)
    const hRes = await pool.query(
      `INSERT INTO hospitals (name, country, timezone)
       VALUES ($1,$2,$3)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [DEMO_HOSPITAL_NAME, DEMO_HOSPITAL_COUNTRY, DEMO_HOSPITAL_TZ]
    );
    let hospitalId = hRes.rows[0]?.id;
    if (!hospitalId) {
      const get = await pool.query(`SELECT id FROM hospitals WHERE name=$1 LIMIT 1`, [DEMO_HOSPITAL_NAME]);
      hospitalId = get.rows[0]?.id;
    }

    if (!hospitalId) throw new Error('Could not determine demo hospital_id for seeding');

    // Ensure Super Admin exists (tied to demo hospital if your schema requires NOT NULL)
    const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
    await pool.query(
      `INSERT INTO hospital_users (id, hospital_id, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, 'super_admin', true)
       ON CONFLICT (email) DO NOTHING`,
      [randomUUID(), hospitalId, SUPER_ADMIN_EMAIL, hash]
    );

    console.log(`✅ Ready. Super admin: ${SUPER_ADMIN_EMAIL} (pwd: ${SUPER_ADMIN_PASSWORD}), Hospital: ${DEMO_HOSPITAL_NAME}`);
  } catch (e) {
    console.error('SEED/BOOT ERROR:', e);
    process.exit(1);
  }
}

ensureDemoHospitalAndSuperAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`Admin API listening on http://localhost:${PORT}`);
  });
});
