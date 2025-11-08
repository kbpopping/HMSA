# Docker PostgreSQL Setup Guide

This guide shows you how to run PostgreSQL in Docker for local development, matching your production setup.

## 🎨 Frontend Development Note

**You can develop the frontend UI without setting up Docker or PostgreSQL!**

The frontend supports **Mock API Mode** which allows you to build and test the UI without any backend setup. See `../frontend/README.md` for details.

**When ready to integrate:**
1. Set up Docker and PostgreSQL (follow instructions below)
2. Update frontend `.env.local`: Set `VITE_USE_MOCK_API=false`

## Prerequisites

- **Docker Desktop** installed on Windows
- If you don't have Docker: Download from https://www.docker.com/products/docker-desktop/

## Quick Start (Recommended)

### Step 1: Start PostgreSQL Container

```powershell
cd C:\Users\USER\Desktop\HMSA\Backend

# Start PostgreSQL container
docker-compose up -d
```

This will:
- Download PostgreSQL 15 image (first time only)
- Create a container named `hmsa-postgres-dev`
- Expose PostgreSQL on `localhost:5432`
- Create database `hospitaldb` automatically
- Create user `dev_admin` with password `Hospitalman22@`

### Step 2: Wait for Database to Be Ready

```powershell
# Check if container is running
docker ps

# Check logs to see when database is ready
docker-compose logs postgres
```

Wait until you see: `database system is ready to accept connections`

### Step 3: Create Database Schema

**Option A - Using Docker exec:**
```powershell
# Copy schema file into container and run it
docker cp schema.sql hmsa-postgres-dev:/tmp/schema.sql
docker exec -i hmsa-postgres-dev psql -U dev_admin -d hospitaldb -f /tmp/schema.sql
```

**Option B - Using psql from host (if you have it installed):**
```powershell
# Connect using localhost
psql -h localhost -U dev_admin -d hospitaldb -f schema.sql
# Password: Hospitalman22@
```

**Option C - Using pgAdmin:**
1. Open pgAdmin
2. Add new server:
   - Name: `HMSA Local Docker`
   - Host: `localhost`
   - Port: `5432`
   - Database: `hospitaldb`
   - Username: `dev_admin`
   - Password: `Hospitalman22@`
3. Connect to `hospitaldb`
4. Open Query Tool
5. Copy/paste contents of `schema.sql`
6. Execute

**Option D - Using your existing schema:**
If you already have the schema in pgAdmin, you can:
1. Export it from your production/containerized DB
2. Connect to this local Docker instance
3. Run the exported SQL

### Step 4: Update .env File (if needed)

Make sure your `.env` file has:
```env
PGHOST=localhost
PGPORT=5432
PGUSER=dev_admin
PGPASSWORD=Hospitalman22@
PGDATABASE=hospitaldb
```

Or use `DATABASE_URL`:
```env
DATABASE_URL=postgresql://dev_admin:Hospitalman22@localhost:5432/hospitaldb
```

### Step 5: Test Database Connection

```powershell
cd C:\Users\USER\Desktop\HMSA\Backend
node check-db.js
```

Should show: `✅ All checks passed!`

### Step 6: Start Backend Server

```powershell
npm start
```

Or:
```powershell
node server.js
```

## Docker Commands Reference

### Start PostgreSQL
```powershell
docker-compose up -d
```

### Stop PostgreSQL (keeps data)
```powershell
docker-compose stop
```

### Stop and Remove Container (keeps data volume)
```powershell
docker-compose down
```

### Stop and Remove Everything (including data)
```powershell
docker-compose down -v
```

### View Logs
```powershell
docker-compose logs -f postgres
```

### Connect to Database via Docker
```powershell
docker exec -it hmsa-postgres-dev psql -U dev_admin -d hospitaldb
```

### Backup Database
```powershell
docker exec hmsa-postgres-dev pg_dump -U dev_admin hospitaldb > backup.sql
```

### Restore Database
```powershell
docker exec -i hmsa-postgres-dev psql -U dev_admin -d hospitaldb < backup.sql
```

## Connecting with pgAdmin

1. **Add New Server:**
   - Name: `HMSA Local Docker`
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `hospitaldb`
   - Username: `dev_admin`
   - Password: `Hospitalman22@`

2. **Test Connection** - Should connect successfully

3. **Use Your Existing Schema:**
   - If you have schema already in pgAdmin, export it
   - Import it into this local Docker instance
   - Or use the `schema.sql` file in this directory

## Migration Path: Development → Production

### When Ready for Production

1. **Export schema from local Docker:**
   ```powershell
   docker exec hmsa-postgres-dev pg_dump -U dev_admin hospitaldb -s > schema-export.sql
   ```

2. **Export data (if needed):**
   ```powershell
   docker exec hmsa-postgres-dev pg_dump -U dev_admin hospitaldb -a > data-export.sql
   ```

3. **Connect to production Docker container** and import:
   ```powershell
   # Replace with your production container details
   docker exec -i <production-container> psql -U <prod-user> -d <prod-db> < schema-export.sql
   ```

Or use pgAdmin to:
- Export from local Docker instance
- Import into production Docker instance

## Troubleshooting

### Container Won't Start
```powershell
# Check Docker is running
docker ps

# Check logs
docker-compose logs postgres

# Restart Docker Desktop if needed
```

### Port 5432 Already in Use
If you have another PostgreSQL running:
```powershell
# Option 1: Stop local PostgreSQL service
Stop-Service postgresql-*

# Option 2: Change port in docker-compose.yml
# Edit ports: "5433:5432" (use 5433 locally)
# Then update .env: PGPORT=5433
```

### Database Connection Fails
1. Verify container is running: `docker ps`
2. Check logs: `docker-compose logs postgres`
3. Test connection: `docker exec -it hmsa-postgres-dev psql -U dev_admin -d hospitaldb`
4. Verify `.env` file has correct values

### Schema Already Exists Error
If you get "relation already exists":
```powershell
# Option 1: Drop and recreate (WARNING: deletes all data)
docker exec -i hmsa-postgres-dev psql -U dev_admin -d hospitaldb -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Option 2: Use IF NOT EXISTS (schema.sql already has this)
# Just re-run schema.sql - it won't duplicate tables
```

## Benefits of Docker Setup

✅ **Matches Production:** Same PostgreSQL version and configuration  
✅ **Easy Cleanup:** Stop/start containers without affecting your system  
✅ **Isolated:** Won't conflict with other PostgreSQL installations  
✅ **Portable:** Easy to share with team members  
✅ **Version Control:** Docker Compose file tracks your exact setup  

## Alternative: Use Your Existing pgAdmin Schema

If you already have a schema in pgAdmin (from your containerized DB):

1. **In pgAdmin:**
   - Right-click on your existing database → Backup
   - Save as `backup.sql`

2. **Connect pgAdmin to local Docker:**
   - Add server: `localhost:5432`
   - Create database `hospitaldb` if it doesn't exist

3. **Restore backup:**
   - Right-click on `hospitaldb` → Restore
   - Select your `backup.sql` file

This way you use your existing schema structure directly!

