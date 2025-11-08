# Backend Server Setup Guide

## Issue: Cannot Start Server

The server requires **PostgreSQL database** to be running with the correct schema.

## Quick Setup Steps

### 1. Check if PostgreSQL is Installed and Running

**Windows PowerShell:**
```powershell
# Check PostgreSQL service status
Get-Service postgresql*

# If service exists but is stopped, start it:
Start-Service postgresql-X-XX  # Replace X-XX with your version
```

**Alternative - Check if PostgreSQL is running:**
```powershell
# Try to connect
psql -U postgres -c "SELECT version();"
```

### 2. Create Database and User (if needed)

**Option A - Using psql:**
```powershell
# Connect as postgres superuser
psql -U postgres

# Then run these commands:
CREATE DATABASE hospitaldb;
CREATE USER dev_admin WITH PASSWORD 'Hospitalman22@';
GRANT ALL PRIVILEGES ON DATABASE hospitaldb TO dev_admin;
\q
```

**Option B - Using pgAdmin (GUI):**
1. Open pgAdmin
2. Right-click on "Databases" → Create → Database
3. Name: `hospitaldb`
4. Right-click on "Login/Group Roles" → Create → Login/Group Role
5. Name: `dev_admin`, Password: `Hospitalman22@`
6. Grant privileges on `hospitaldb` to `dev_admin`

### 3. Create Database Schema

**Via psql:**
```powershell
cd C:\Users\USER\Desktop\HMSA\Backend
psql -U dev_admin -d hospitaldb -f schema.sql
```

**Via pgAdmin:**
1. Connect to `hospitaldb` database
2. Open Query Tool
3. Copy contents of `schema.sql`
4. Execute

### 4. Test Database Connection

```powershell
cd C:\Users\USER\Desktop\HMSA\Backend
node test-db.js
```

**Expected:** `✅ Database connection successful!`

### 5. Start the Server

```powershell
cd C:\Users\USER\Desktop\HMSA\Backend
npm start
```

Or:
```powershell
node server.js
```

**Expected Output:**
```
✅ Ready. Super admin: superadmin@demo.com (pwd: demo123!), Hospital: Demo General Hospital
Admin API listening on http://localhost:8082
```

## Common Issues

### Issue 1: PostgreSQL Service Not Running
**Error:** Connection refused or timeout

**Fix:**
```powershell
# Start PostgreSQL service
Start-Service postgresql-X-XX

# Or use Services app:
# Win+R → services.msc → Find PostgreSQL → Start
```

### Issue 2: Database Doesn't Exist
**Error:** `database "hospitaldb" does not exist`

**Fix:**
```sql
CREATE DATABASE hospitaldb;
```

### Issue 3: User Doesn't Have Permissions
**Error:** Permission denied

**Fix:**
```sql
-- As postgres user:
GRANT ALL PRIVILEGES ON DATABASE hospitaldb TO dev_admin;
```

### Issue 4: Tables Don't Exist
**Error:** `relation "hospitals" does not exist`

**Fix:** Run `schema.sql` to create all tables

### Issue 5: Wrong Connection Details
**Check your `.env` file matches:**
- PostgreSQL is running on `localhost:5432`
- User `dev_admin` exists
- Password matches
- Database `hospitaldb` exists

## Verification Checklist

- [ ] PostgreSQL service is running
- [ ] Database `hospitaldb` exists
- [ ] User `dev_admin` exists and has password `Hospitalman22@`
- [ ] Schema has been created (run `schema.sql`)
- [ ] `node test-db.js` succeeds
- [ ] `.env` file has correct configuration
- [ ] `npm install` has been run (dependencies installed)

## Quick Command Reference

```powershell
# Navigate to backend
cd C:\Users\USER\Desktop\HMSA\Backend

# Test database
node test-db.js

# Start server
npm start
# OR
node server.js
```

