# Material King - Database Setup Guide

## 🗄️ PostgreSQL Database Setup

Your Material King admin panel needs a PostgreSQL database to store all the data.

---

## 📦 What's Included

1. **B2B_Platform_Database_Schema.sql** (58 KB)
   - Complete database schema
   - 50+ tables with relationships
   - All indexes, triggers, views
   - Seed data (admin user, zones, categories)

2. **Database_Schema_Documentation.md** (34 KB)
   - Complete documentation
   - Table descriptions
   - Relationships
   - Sample queries

---

## 🚀 Quick Setup (3 Options)

### Option 1: Local PostgreSQL (Recommended for Development)

#### Step 1: Install PostgreSQL

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**On macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**On Windows:**
Download from: https://www.postgresql.org/download/windows/

#### Step 2: Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE material_king;

# Create user (optional)
CREATE USER mk_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE material_king TO mk_admin;

# Exit
\q
```

#### Step 3: Import Schema

```bash
# Import the schema
psql -U postgres -d material_king -f database/B2B_Platform_Database_Schema.sql

# Or if using created user
psql -U mk_admin -d material_king -f database/B2B_Platform_Database_Schema.sql
```

#### Step 4: Verify Installation

```bash
psql -U postgres -d material_king

# Check tables
\dt

# You should see 50+ tables
# Exit
\q
```

---

### Option 2: Docker PostgreSQL (Easiest)

#### Step 1: Create Docker Compose File

```bash
cat > docker-compose.yml << 'DOCKER_EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: material_king_db
    environment:
      POSTGRES_DB: material_king
      POSTGRES_USER: mk_admin
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d

volumes:
  postgres_data:
DOCKER_EOF
```

#### Step 2: Start Database

```bash
docker-compose up -d
```

#### Step 3: Verify

```bash
docker exec -it material_king_db psql -U mk_admin -d material_king

# Check tables
\dt

# Exit
\q
```

**Database is ready!** Schema is automatically imported.

---

### Option 3: Cloud PostgreSQL (Recommended for Production)

#### A. Supabase (Free Tier)

1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Import schema:

```bash
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  -f database/B2B_Platform_Database_Schema.sql
```

#### B. ElephantSQL (Free Tier)

1. Go to https://www.elephantsql.com
2. Create new instance (Tiny Turtle - Free)
3. Copy connection details
4. Import schema:

```bash
psql "postgres://[user]:[password]@[server].db.elephantsql.com/[user]" \
  -f database/B2B_Platform_Database_Schema.sql
```

#### C. Railway (Free Tier)

1. Go to https://railway.app
2. New Project → PostgreSQL
3. Copy connection string
4. Import schema (same as above)

---

## ⚙️ Configure Admin Panel

After database is set up, configure your admin panel:

### Step 1: Create .env File

```bash
# In material-king-admin folder
cat > .env << 'ENV_EOF'
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=material_king
DATABASE_USER=mk_admin
DATABASE_PASSWORD=your_secure_password

# Or use full connection string
DATABASE_URL=postgresql://mk_admin:your_secure_password@localhost:5432/material_king

# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
ENV_EOF
```

### Step 2: Update Admin Panel

In `src/App.tsx`, change line 8:

```typescript
const USE_REAL_API = true;  // Now using real database!
```

---

## 🗃️ Database Structure Overview

### Key Tables (50+ total)

**User Management:**
- users (authentication)
- user_roles (RBAC)
- user_sessions (JWT tokens)

**Geographic:**
- zones (service areas)
- zone_pincodes (pincode mapping)

**Vendor Management:**
- vendors (vendor master)
- vendor_documents (KYC docs)
- vendor_staff (employees)
- zone_vendor_assignments

**Product Catalog:**
- categories
- brands  
- products (SKUs)
- product_images
- product_pricing (with tiers)
- pricing_tiers

**Inventory:**
- inventory
- inventory_transactions

**Dealer Management:**
- dealers
- dealer_credit_history

**Order Management:**
- orders
- order_items
- order_status_history

**Dispatch & Delivery:**
- dispatches
- delivery_proofs

**Supply Chain:**
- purchase_orders
- purchase_order_items
- goods_receipt_notes
- grn_items
- barcodes

**Financial:**
- payments
- settlements

**Disputes:**
- disputes

**Logistics:**
- shipping_rates

**System:**
- audit_logs
- system_settings
- notifications

---

## 📊 Seed Data Included

After importing, you'll have:

**1. Super Admin User:**
- Email: admin@platform.com
- Phone: 9999999999
- Password: (needs to be set - see below)

**2. Zones:**
- Mumbai North (ZONE-MUM-N)
- Mumbai South (ZONE-MUM-S)
- Delhi NCR East (ZONE-DEL-E)

**3. Categories:**
- Plywood
- Cement
- Tiles

**4. Brands:**
- Century Plyboards
- Greenply
- ACC Cement
- UltraTech

**5. Default Shipping Rate:**
- ₹2,000 per CBM
- ₹500 minimum charge

---

## 🔐 Set Admin Password

```sql
-- Connect to database
psql -U mk_admin -d material_king

-- Set password for admin user
UPDATE users 
SET password_hash = crypt('your_password', gen_salt('bf'))
WHERE email = 'admin@platform.com';

-- Verify
SELECT email, is_active, is_verified FROM users WHERE user_type = 'admin';
```

---

## 🔌 Connect Backend (NestJS)

### Step 1: Install Dependencies

```bash
npm install @nestjs/typeorm typeorm pg
```

### Step 2: Configure TypeORM

```typescript
// app.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Use migrations in production
    }),
  ],
})
export class AppModule {}
```

---

## 🧪 Test Database Connection

### From Command Line:

```bash
psql -U mk_admin -d material_king

-- Test queries
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM zones;
SELECT COUNT(*) FROM categories;

-- Check seed data
SELECT * FROM zones;
SELECT * FROM categories;
SELECT * FROM brands;
```

### From Your App:

Create a test script:

```typescript
// test-db.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'material_king',
  user: 'mk_admin',
  password: 'your_secure_password',
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    console.log('✅ Database connected!');
    console.log('Users count:', result.rows[0].count);
    
    const zones = await pool.query('SELECT * FROM zones');
    console.log('Zones:', zones.rows);
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
```

Run: `npx ts-node test-db.ts`

---

## 📝 Common Queries

### Get All Vendors:
```sql
SELECT v.*, z.zone_name 
FROM vendors v
LEFT JOIN zone_vendor_assignments zva ON v.id = zva.vendor_id
LEFT JOIN zones z ON zva.zone_id = z.id
WHERE v.is_active = true;
```

### Get Orders with Details:
```sql
SELECT o.*, b.company_name as buyer, v.company_name as vendor
FROM orders o
JOIN buyers b ON o.buyer_id = b.id
LEFT JOIN vendors v ON o.assigned_vendor_id = v.id
ORDER BY o.created_at DESC
LIMIT 10;
```

### Get Dealer Credit Status:
```sql
SELECT 
  d.*,
  d.credit_limit - d.available_credit as used_credit,
  COUNT(o.id) as total_orders
FROM dealers d
LEFT JOIN orders o ON d.id = o.dealer_id
GROUP BY d.id;
```

---

## 🛠️ Maintenance

### Backup Database:

```bash
# Full backup
pg_dump -U mk_admin material_king > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump -U mk_admin material_king --schema-only > schema_backup.sql

# Data only
pg_dump -U mk_admin material_king --data-only > data_backup.sql
```

### Restore Database:

```bash
psql -U mk_admin material_king < backup_20260218.sql
```

### Reset Database:

```bash
# Drop and recreate
psql -U postgres

DROP DATABASE material_king;
CREATE DATABASE material_king;
GRANT ALL PRIVILEGES ON DATABASE material_king TO mk_admin;
\q

# Re-import schema
psql -U mk_admin material_king -f database/B2B_Platform_Database_Schema.sql
```

---

## ⚠️ Production Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Set up SSL connection
- [ ] Configure connection pooling
- [ ] Enable query logging
- [ ] Set up automated backups
- [ ] Configure firewall rules
- [ ] Use environment variables (never hardcode passwords)
- [ ] Enable audit logging
- [ ] Set up monitoring (pg_stat_statements)
- [ ] Plan for scaling (replication, partitioning)

---

## 🆘 Troubleshooting

### Can't connect to PostgreSQL:

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Check if port is open
sudo netstat -tulpn | grep 5432
```

### Permission denied:

```bash
# Grant proper permissions
psql -U postgres

GRANT ALL PRIVILEGES ON DATABASE material_king TO mk_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mk_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mk_admin;
```

### Schema import errors:

```bash
# Import with verbose output
psql -U mk_admin -d material_king -f database/B2B_Platform_Database_Schema.sql -v ON_ERROR_STOP=1
```

---

## 📖 Next Steps

1. ✅ Database setup complete
2. ✅ Schema imported (50+ tables)
3. ✅ Seed data loaded
4. ⏭️ Configure admin panel (.env file)
5. ⏭️ Build NestJS backend
6. ⏭️ Connect frontend to backend

---

**Your Material King database is now ready!** 🎉

For complete schema documentation, see `Database_Schema_Documentation.md`
