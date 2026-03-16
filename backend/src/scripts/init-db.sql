-- Material King - Database Schema
-- Run: psql -U postgres -d material_king -f src/scripts/init-db.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  phone         VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  user_type     VARCHAR(20) NOT NULL DEFAULT 'buyer'
                CHECK (user_type IN ('admin','vendor','buyer','dealer')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until  TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id        SERIAL PRIMARY KEY,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ============================================================
-- USER SESSIONS (refresh tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ZONES
-- ============================================================
CREATE TABLE IF NOT EXISTS zones (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id   INT REFERENCES categories(id) ON DELETE SET NULL,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  logo_url    TEXT,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VENDORS
-- ============================================================
CREATE TABLE IF NOT EXISTS vendors (
  id            SERIAL PRIMARY KEY,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  company_name  VARCHAR(200) NOT NULL,
  contact_name  VARCHAR(100),
  email         VARCHAR(255),
  phone         VARCHAR(20),
  gstin         VARCHAR(20),
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  pincode       VARCHAR(10),
  zone_id       INT REFERENCES zones(id) ON DELETE SET NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  slug                VARCHAR(255) UNIQUE NOT NULL,
  description         TEXT,
  sku                 VARCHAR(50) UNIQUE,
  hsn_code            VARCHAR(20),
  isin                VARCHAR(50),
  category_id         INT REFERENCES categories(id) ON DELETE SET NULL,
  brand_id            INT REFERENCES brands(id) ON DELETE SET NULL,
  brand_collection    VARCHAR(100),
  vendor_id           INT REFERENCES vendors(id) ON DELETE SET NULL,
  unit                VARCHAR(20) DEFAULT 'piece',
  price               NUMERIC(12,2) NOT NULL DEFAULT 0,
  mrp                 NUMERIC(12,2),
  stock_qty           INT NOT NULL DEFAULT 0,
  min_order_qty       INT NOT NULL DEFAULT 1,
  image_url           TEXT,
  images              JSONB DEFAULT '[]',
  specifications      JSONB DEFAULT '{}',
  -- Dimensions (mm)
  length_mm           NUMERIC(10,2),
  breadth_mm          NUMERIC(10,2),
  width_mm            NUMERIC(10,2),
  thickness_mm        NUMERIC(10,2),
  weight_kg           NUMERIC(10,3),
  -- Packaging
  box_length_mm       NUMERIC(10,2),
  box_breadth_mm      NUMERIC(10,2),
  box_width_mm        NUMERIC(10,2),
  box_weight_kg       NUMERIC(10,3),
  -- Product attributes
  colour              VARCHAR(100),
  grade               VARCHAR(50),
  material            VARCHAR(100),
  calibration         VARCHAR(100),
  certification       VARCHAR(255),
  termite_resistance  VARCHAR(100),
  warranty            VARCHAR(100),
  country_of_origin   VARCHAR(100) DEFAULT 'India',
  customer_care_details TEXT,
  tech_sheet_url      TEXT,
  -- Additional details
  manufactured_by     VARCHAR(255),
  packaged_by         VARCHAR(255),
  lead_time_days      INT,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DEALERS
-- ============================================================
CREATE TABLE IF NOT EXISTS dealers (
  id            SERIAL PRIMARY KEY,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  company_name  VARCHAR(200) NOT NULL,
  contact_name  VARCHAR(100),
  email         VARCHAR(255),
  phone         VARCHAR(20),
  gstin         VARCHAR(20),
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  pincode       VARCHAR(10),
  zone_id       INT REFERENCES zones(id) ON DELETE SET NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BUYERS
-- ============================================================
CREATE TABLE IF NOT EXISTS buyers (
  id            SERIAL PRIMARY KEY,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  company_name  VARCHAR(200),
  contact_name  VARCHAR(100),
  email         VARCHAR(255),
  phone         VARCHAR(20),
  gstin         VARCHAR(20),
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  pincode       VARCHAR(10),
  zone_id       INT REFERENCES zones(id) ON DELETE SET NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  order_number    VARCHAR(30) UNIQUE NOT NULL,
  buyer_id        INT REFERENCES buyers(id) ON DELETE SET NULL,
  dealer_id       INT REFERENCES dealers(id) ON DELETE SET NULL,
  vendor_id       INT REFERENCES vendors(id) ON DELETE SET NULL,
  status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_method  VARCHAR(30) NOT NULL DEFAULT 'cod'
                  CHECK (payment_method IN ('cod','upi','netbanking','card')),
  payment_status  VARCHAR(30) NOT NULL DEFAULT 'unpaid'
                  CHECK (payment_status IN ('unpaid','paid','refunded')),
  total_amount    NUMERIC(14,2) NOT NULL DEFAULT 0,
  shipping_address TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INT REFERENCES products(id) ON DELETE SET NULL,
  quantity    INT NOT NULL DEFAULT 1,
  unit_price  NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CART ITEMS (persistent cart per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(50) UNIQUE NOT NULL,
  description   TEXT,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage'
                CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC(12,2) NOT NULL,
  min_order_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  max_discount   NUMERIC(14,2),
  usage_limit    INT,
  used_count     INT NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  valid_from     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BUYER ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS buyer_addresses (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       VARCHAR(50) NOT NULL DEFAULT 'Home',
  full_name   VARCHAR(200) NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL,
  pincode     VARCHAR(10) NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WISHLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlists (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_buyer_addresses_user ON buyer_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
