#!/bin/bash
# ============================================================
# MaterialKing - CentOS VPS Deployment Script
# GoDaddy VPS with CentOS 7/8/Stream
# ============================================================

echo "============================================"
echo "MaterialKing - CentOS VPS Setup"
echo "============================================"

# ============================================================
# STEP 1: System Update
# ============================================================
echo "[1/8] Updating system..."
sudo yum update -y
sudo yum install -y epel-release
sudo yum install -y git curl wget nano

# ============================================================
# STEP 2: Install Node.js 20 LTS
# ============================================================
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
node -v
npm -v

# Install PM2 globally
sudo npm install -g pm2

# ============================================================
# STEP 3: Install PostgreSQL 16
# ============================================================
echo "[3/8] Installing PostgreSQL 16..."

# For CentOS 7:
# sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# For CentOS 8 / Stream:
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf -qy module disable postgresql
sudo dnf install -y postgresql16-server postgresql16

# Initialize and start PostgreSQL
sudo /usr/pgsql-16/bin/postgresql-16-setup initdb
sudo systemctl start postgresql-16
sudo systemctl enable postgresql-16

echo "PostgreSQL installed and started."

# ============================================================
# STEP 4: Configure PostgreSQL
# ============================================================
echo "[4/8] Configuring PostgreSQL..."

# Create database and user
sudo -u postgres psql << 'SQLEOF'
CREATE USER mk_user WITH PASSWORD 'YOUR_STRONG_PASSWORD_HERE';
CREATE DATABASE material_king OWNER mk_user;
GRANT ALL PRIVILEGES ON DATABASE material_king TO mk_user;
\q
SQLEOF

# Update pg_hba.conf to allow password auth
PG_HBA=$(sudo -u postgres psql -t -c "SHOW hba_file;" | xargs)
sudo cp $PG_HBA ${PG_HBA}.backup
sudo sed -i 's/ident/md5/g' $PG_HBA
sudo sed -i 's/peer/md5/g' $PG_HBA
sudo systemctl restart postgresql-16

echo "PostgreSQL configured. DB: material_king, User: mk_user"

# ============================================================
# STEP 5: Install Nginx
# ============================================================
echo "[5/8] Installing Nginx..."
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Open firewall ports
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload

echo "Nginx installed and firewall configured."

# ============================================================
# STEP 6: Clone Project
# ============================================================
echo "[6/8] Cloning project..."
cd /var/www
sudo git clone https://github.com/snehakreon/materialking.git
sudo chown -R $USER:$USER /var/www/materialking
cd /var/www/materialking
git checkout claude/review-materialking-project-DoorX

# ============================================================
# STEP 7: Setup Backend
# ============================================================
echo "[7/8] Setting up backend..."
cd /var/www/materialking/backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'ENVEOF'
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=mk_user
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE
DB_NAME=material_king
JWT_SECRET=CHANGE_THIS_TO_A_RANDOM_64_CHAR_STRING
JWT_REFRESH_SECRET=CHANGE_THIS_TO_ANOTHER_RANDOM_64_CHAR_STRING
CORS_ORIGIN=https://materialking.in,https://admin.materialking.in
ENVEOF

echo ">> IMPORTANT: Edit /var/www/materialking/backend/.env and change passwords!"

# Build TypeScript
npm run build

# Import database schema
PGPASSWORD=YOUR_STRONG_PASSWORD_HERE psql -U mk_user -d material_king -h localhost \
  -f src/scripts/init-db.sql
PGPASSWORD=YOUR_STRONG_PASSWORD_HERE psql -U mk_user -d material_king -h localhost \
  -f src/scripts/migration.sql
PGPASSWORD=YOUR_STRONG_PASSWORD_HERE psql -U mk_user -d material_king -h localhost \
  -f src/scripts/migrate-inventory.sql
PGPASSWORD=YOUR_STRONG_PASSWORD_HERE psql -U mk_user -d material_king -h localhost \
  -f src/scripts/migrate-cart-orders.sql
PGPASSWORD=YOUR_STRONG_PASSWORD_HERE psql -U mk_user -d material_king -h localhost \
  -f src/scripts/seed-data.sql

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Start with PM2
pm2 start dist/server.js --name "materialking-api"
pm2 save
pm2 startup systemd

echo "Backend running on port 5000."

# ============================================================
# STEP 8: Setup Frontend + Admin
# ============================================================
echo "[8/8] Building frontends..."

# Build storefront
cd /var/www/materialking/frontend
npm install
npm run build

# Build admin panel
cd /var/www/materialking/material-king-admin
npm install
npm run build

echo "Frontends built."
echo ""
echo "============================================"
echo "SETUP COMPLETE!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Edit backend .env: nano /var/www/materialking/backend/.env"
echo "2. Setup Nginx config (see below)"
echo "3. Install SSL with certbot"
echo "4. Point DNS to this server IP"
echo ""
