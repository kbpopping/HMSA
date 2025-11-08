# HMSA Backend Server

Express.js backend server for Hospital Management System Admin.

## 🎨 Frontend Development Note

**You can develop the frontend UI without setting up the backend!**

The frontend supports **Mock API Mode** which allows you to build and test the UI without a database or backend server. See `../frontend/README.md` for details.

**When ready to integrate:**
1. Set up the backend (follow instructions below)
2. Update frontend `.env.local`: Set `VITE_USE_MOCK_API=false`

## Prerequisites

1. **Node.js** (v18 or higher) - ✅ You have v22.17.1
2. **PostgreSQL** (v12 or higher) - Can be installed locally OR run via Docker (recommended)

## Database Setup

### 🐳 Recommended: Docker Setup

**If you're using Docker (matches production environment):**

👉 **See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for complete Docker instructions**

Quick start:
```powershell
cd C:\Users\USER\Desktop\HMSA\Backend
docker-compose up -d    # Start PostgreSQL container
# Wait for container to be ready, then:
# Apply schema (see DOCKER_SETUP.md)
npm start               # Start backend server
```

### 💻 Alternative: Local PostgreSQL Installation

**If you prefer to install PostgreSQL directly on Windows:**

### Step 1: Start PostgreSQL Service

Make sure PostgreSQL is running:

**Windows:**
```powershell
# Check if PostgreSQL service is running
Get-Service postgresql*

# If not running, start it (replace X with your version number)
Start-Service postgresql-X-XX
```

Or use **pgAdmin** or **Services** app to start PostgreSQL.

### Step 2: Create Database

Open PostgreSQL command line (psql) or pgAdmin, then run:

```sql
-- Connect as postgres superuser first
CREATE DATABASE hospitaldb;

-- Grant permissions to your user
GRANT ALL PRIVILEGES ON DATABASE hospitaldb TO dev_admin;
```

**Via Command Line (psql):**
```bash
psql -U postgres
CREATE DATABASE hospitaldb;
\q

# Connect to the new database
psql -U dev_admin -d hospitaldb
```

### Step 3: Create Schema

Run the schema.sql file to create all tables:

**Option A - Via psql command line:**
```bash
psql -U dev_admin -d hospitaldb -f schema.sql
```

**Option B - Via pgAdmin:**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on `hospitaldb` database → Query Tool
4. Open `schema.sql` file
5. Execute the query

**Option C - Copy and paste:**
```bash
# In PowerShell, navigate to Backend directory
cd C:\Users\USER\Desktop\HMSA\Backend

# Run the schema
psql -U dev_admin -d hospitaldb -f schema.sql
```

### Step 4: Verify Database Connection

Test the connection:
```bash
cd C:\Users\USER\Desktop\HMSA\Backend
node test-db.js
```

You should see: `✅ Database connection successful!`

## Installation

If you haven't installed dependencies yet:

```bash
cd C:\Users\USER\Desktop\HMSA\Backend
npm install
```

## Configuration

The `.env` file should already exist with:
```
PGHOST=localhost
PGPORT=5432
PGUSER=dev_admin
PGPASSWORD=Hospitalman22@
PGDATABASE=hospitaldb
PORT=8082
CORS_ORIGIN=http://localhost:5173
```

## Starting the Server

### Command to Start:

```bash
cd C:\Users\USER\Desktop\HMSA\Backend
npm start
```

Or:

```bash
node server.js
```

### Expected Output:

```
✅ Ready. Super admin: superadmin@demo.com (pwd: demo123!), Hospital: Demo General Hospital
Admin API listening on http://localhost:8082
```

## Troubleshooting

### Issue: "Database connection failed"

**Solutions:**
1. **PostgreSQL not running:**
   - Check Windows Services for PostgreSQL
   - Start PostgreSQL service
   
2. **Database doesn't exist:**
   - Create database: `CREATE DATABASE hospitaldb;`
   
3. **Wrong credentials:**
   - Check `.env` file matches your PostgreSQL setup
   - Verify user `dev_admin` exists and has permissions
   
4. **Tables don't exist:**
   - Run `schema.sql` to create all tables
   - Make sure you're connected to the correct database

### Issue: "port 8082 already in use"

**Solution:**
```bash
# Find and kill process on port 8082 (Windows)
netstat -ano | findstr :8082
taskkill /PID <PID_NUMBER> /F

# Or change PORT in .env file to a different port
```

### Issue: "Cannot connect to PostgreSQL"

**Check:**
1. PostgreSQL is installed
2. Service is running
3. Port 5432 is not blocked
4. User credentials in `.env` are correct

## Default Credentials

After setup, you can login with:
- **Email:** `superadmin@demo.com`
- **Password:** `demo123!` (or `demo123` if .env has different value)

## API Endpoints

- Health check: `GET http://localhost:8082/health`
- Login: `POST http://localhost:8082/api/auth/login`
- List Hospitals: `GET http://localhost:8082/api/super/hospitals` (requires auth)

## Development

The server will automatically:
- Create demo hospital if it doesn't exist
- Create super admin user if it doesn't exist
- Seed initial data on startup

