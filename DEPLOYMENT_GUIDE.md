# Material King - Server Deployment Guide

## Table of Contents
1. [Server Requirements](#1-server-requirements)
2. [Server Setup (Ubuntu/Debian)](#2-server-setup-ubuntudebian)
3. [PostgreSQL Setup](#3-postgresql-setup)
4. [Database Schema & Backup](#4-database-schema--backup)
5. [Backend Deployment](#5-backend-deployment)
6. [Frontend Deployment](#6-frontend-deployment)
7. [Nginx Reverse Proxy](#7-nginx-reverse-proxy)
8. [SSL Certificate (HTTPS)](#8-ssl-certificate-https)
9. [Process Manager (PM2)](#9-process-manager-pm2)
10. [Maintenance & Backups](#10-maintenance--backups)

---

## 1. Server Requirements

| Component       | Minimum           |
|-----------------|-------------------|
| OS              | Ubuntu 22.04 LTS  |
| RAM             | 2 GB              |
| CPU             | 1 vCPU            |
| Disk            | 20 GB SSD         |
| Node.js         | v18+ (LTS)        |
| PostgreSQL      | v14+              |
| Nginx           | Latest             |

---

## 2. Server Setup (Ubuntu/Debian)

### 2.1 Update system
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should show v20.x
npm -v
```

### 2.3 Install build tools
```bash
sudo apt install -y git build-essential
```

### 2.4 Install PM2 (process manager)
```bash
sudo npm install -g pm2
```

### 2.5 Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

---

## 3. PostgreSQL Setup

### 3.1 Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 3.2 Create database and user
```bash
sudo -u postgres psql
```

Inside psql:
```sql
CREATE USER materialking WITH PASSWORD 'YOUR_STRONG_PASSWORD_HERE';
CREATE DATABASE material_king OWNER materialking;
GRANT ALL PRIVILEGES ON DATABASE material_king TO materialking;
\q
```

### 3.3 Initialize the database schema
```bash
# From the project root directory
sudo -u postgres psql -d material_king -f backend/src/scripts/init-db.sql
```

### 3.4 Run migration scripts (in order)
```bash
sudo -u postgres psql -d material_king -f backend/src/scripts/migration.sql
sudo -u postgres psql -d material_king -f backend/src/scripts/migrate-cart-orders.sql
sudo -u postgres psql -d material_king -f backend/src/scripts/migrate-inventory.sql
sudo -u postgres psql -d material_king -f backend/src/scripts/backfill-entity-records.sql
```

### 3.5 Seed sample data (optional)
```bash
cd backend
npm run seed
```

---

## 4. Database Schema & Backup

### 4.1 Full SQL Backup Command (take backup from existing server)
```bash
# Export full database (schema + data)
pg_dump -U postgres -d material_king --no-owner --no-acl -F plain -f material_king_backup.sql

# Export schema only (no data)
pg_dump -U postgres -d material_king --schema-only --no-owner -f material_king_schema.sql

# Export data only
pg_dump -U postgres -d material_king --data-only --no-owner -f material_king_data.sql
```

### 4.2 Restore backup on new server
```bash
# Create the database first (see step 3.2), then restore:
sudo -u postgres psql -d material_king -f material_king_backup.sql
```

### 4.3 Automated daily backup script
Create file `/opt/scripts/backup-materialking.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/materialking"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="material_king_${TIMESTAMP}.sql.gz"

mkdir -p $BACKUP_DIR

# Create compressed backup
pg_dump -U materialking -d material_king | gzip > "$BACKUP_DIR/$FILENAME"

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup complete: $FILENAME"
```

Set up cron job:
```bash
chmod +x /opt/scripts/backup-materialking.sh
sudo crontab -e
# Add this line for daily backup at 2 AM:
0 2 * * * /opt/scripts/backup-materialking.sh >> /var/log/mk-backup.log 2>&1
```

---

## 5. Backend Deployment

### 5.1 Clone the project
```bash
cd /var/www
git clone https://github.com/mindforgeerp/materialking.git
cd materialking
```

### 5.2 Install backend dependencies
```bash
cd backend
npm install
```

### 5.3 Create environment file
```bash
nano backend/.env
```

Add the following (update values for production):
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=materialking
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE
DB_NAME=material_king
JWT_SECRET=GENERATE_A_64_CHAR_RANDOM_STRING
JWT_REFRESH_SECRET=GENERATE_ANOTHER_64_CHAR_RANDOM_STRING
```

Generate secure secrets:
```bash
# Run this twice, once for each secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5.4 Build the backend
```bash
cd backend
npm run build
```

### 5.5 Create uploads directory
```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### 5.6 Test the backend
```bash
cd backend
node dist/server.js
# Should show: Material King API running on port 5000
# Press Ctrl+C to stop
```

---

## 6. Frontend Deployment

### 6.1 Update API base URL

Edit `frontend/src/services/api.ts` and change the base URL:
```typescript
// Change FROM:
baseURL: "http://localhost:5000/api",
// Change TO:
baseURL: "https://yourdomain.com/api",

// Also update the refresh token URL further down in the file:
// Change FROM:
await axios.post("http://localhost:5000/api/auth/refresh", { refreshToken })
// Change TO:
await axios.post("https://yourdomain.com/api/auth/refresh", { refreshToken })
```

### 6.2 Build the frontend
```bash
cd frontend
npm install
npm run build
# Output will be in frontend/dist/
```

### 6.3 Copy build to Nginx web root
```bash
sudo mkdir -p /var/www/materialking-frontend
sudo cp -r frontend/dist/* /var/www/materialking-frontend/
```

---

## 7. Nginx Reverse Proxy

### 7.1 Create Nginx config
```bash
sudo nano /etc/nginx/sites-available/materialking
```

Add the following config:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React SPA)
    root /var/www/materialking-frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # API reverse proxy -> backend on port 5000
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }

    # Uploaded files (product images etc.)
    location /uploads/ {
        alias /var/www/materialking/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # React SPA fallback - all other routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 7.2 Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/materialking /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. SSL Certificate (HTTPS)

### 8.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2 Get SSL certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 8.3 Auto-renewal (already set up by certbot, verify with):
```bash
sudo certbot renew --dry-run
```

---

## 9. Process Manager (PM2)

### 9.1 Start backend with PM2
```bash
cd /var/www/materialking/backend
pm2 start dist/server.js --name "materialking-api"
```

### 9.2 Save PM2 process list and enable startup
```bash
pm2 save
pm2 startup
# Run the command it outputs (starts PM2 on server reboot)
```

### 9.3 Useful PM2 commands
```bash
pm2 status                    # Check running processes
pm2 logs materialking-api     # View logs
pm2 restart materialking-api  # Restart the API
pm2 monit                     # Monitor CPU/memory
```

---

## 10. Maintenance & Backups

### 10.1 Updating the application
```bash
cd /var/www/materialking

# Pull latest code
git pull origin main

# Rebuild backend
cd backend
npm install
npm run build
pm2 restart materialking-api

# Rebuild frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/materialking-frontend/
```

### 10.2 Manual database backup
```bash
pg_dump -U materialking -d material_king | gzip > ~/material_king_$(date +%Y%m%d).sql.gz
```

### 10.3 Restore from backup
```bash
# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE material_king;"
sudo -u postgres psql -c "CREATE DATABASE material_king OWNER materialking;"

# Restore
gunzip -c material_king_20260321.sql.gz | sudo -u postgres psql -d material_king
```

### 10.4 Monitor disk space
```bash
df -h
du -sh /opt/backups/materialking/
du -sh /var/www/materialking/backend/uploads/
```

### 10.5 View application logs
```bash
pm2 logs materialking-api --lines 100
```

---

## Quick Reference - Full Deployment Checklist

```
[ ] 1. Server provisioned (Ubuntu 22.04, 2GB RAM)
[ ] 2. Node.js 20, PostgreSQL 14+, Nginx installed
[ ] 3. Database created and schema initialized (init-db.sql)
[ ] 4. Migration scripts run (migration.sql, migrate-cart-orders.sql, migrate-inventory.sql)
[ ] 5. Backend .env configured with production credentials
[ ] 6. Backend built (npm run build)
[ ] 7. Frontend API URLs updated to production domain
[ ] 8. Frontend built (npm run build) and copied to /var/www/
[ ] 9. Nginx configured with reverse proxy
[ ] 10. SSL certificate installed (certbot)
[ ] 11. PM2 running backend, startup enabled
[ ] 12. Automated backup cron job configured
[ ] 13. First admin user seeded or registered
[ ] 14. DNS A record pointing to server IP
```

---

## Environment Variables Reference

| Variable             | Description                  | Example                          |
|----------------------|------------------------------|----------------------------------|
| `PORT`               | Backend API port             | `5000`                           |
| `DB_HOST`            | PostgreSQL host              | `localhost`                      |
| `DB_PORT`            | PostgreSQL port              | `5432`                           |
| `DB_USER`            | Database username            | `materialking`                   |
| `DB_PASSWORD`        | Database password            | `your_secure_password`           |
| `DB_NAME`            | Database name                | `material_king`                  |
| `JWT_SECRET`         | Access token signing key     | `64-char hex string`             |
| `JWT_REFRESH_SECRET` | Refresh token signing key    | `64-char hex string`             |
