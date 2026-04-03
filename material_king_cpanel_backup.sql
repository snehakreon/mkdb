-- ============================================================
-- MaterialKing - Full Database Setup for cPanel Import
-- Generated: 2026-04-02
-- Usage: Import via cPanel phpPgAdmin or psql
-- ============================================================

-- ============ STEP 1: SCHEMA (init-db.sql) ============
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
                  CHECK (status IN ('pending','pending_dealer_approval','confirmed','dispatched','in_transit','delivered','partially_delivered','cancelled','disputed')),
  payment_method  VARCHAR(30) NOT NULL DEFAULT 'cod'
                  CHECK (payment_method IN ('cod','upi','netbanking','card')),
  payment_status  VARCHAR(30) NOT NULL DEFAULT 'unpaid'
                  CHECK (payment_status IN ('unpaid','paid','refunded')),
  total_amount    NUMERIC(14,2) NOT NULL DEFAULT 0,
  shipping_address TEXT,
  notes           TEXT,
  expected_delivery_date DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id                  SERIAL PRIMARY KEY,
  order_id            INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id          INT REFERENCES products(id) ON DELETE SET NULL,
  quantity            INT NOT NULL DEFAULT 1,
  unit_price          NUMERIC(12,2) NOT NULL,
  total_price         NUMERIC(12,2) NOT NULL,
  fulfillment_status  VARCHAR(30) DEFAULT 'in_stock'
                      CHECK (fulfillment_status IN ('in_stock','back_order')),
  quantity_back_order INT DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDER STATUS HISTORY (audit trail for status transitions)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status VARCHAR(30),
  to_status   VARCHAR(30) NOT NULL,
  changed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  notes       TEXT,
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
-- INVENTORY (reorder levels per product)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id            SERIAL PRIMARY KEY,
  product_id    INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reorder_level INT NOT NULL DEFAULT 10,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id)
);

-- ============================================================
-- INVENTORY TRANSACTIONS (stock movement log)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id              SERIAL PRIMARY KEY,
  product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  transaction_type VARCHAR(30) NOT NULL
                  CHECK (transaction_type IN ('add','reduce','reserve','adjust')),
  quantity_change  INT NOT NULL,
  quantity_before  INT NOT NULL,
  quantity_after   INT NOT NULL,
  reason          TEXT,
  reference_type  VARCHAR(30),
  reference_id    VARCHAR(50),
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_ref ON inventory_transactions(reference_type, reference_id);


-- ============ STEP 2: MIGRATION (migration.sql) ============
-- Migration: Add slug column to categories and brands tables
-- Run this after applying FullSchema.sql if the slug column doesn't exist

-- Add slug to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
UPDATE categories SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;

-- Add slug to brands
ALTER TABLE brands ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
UPDATE brands SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;

-- ============================================================
-- Fix orders status CHECK constraint to match state machine
-- ============================================================
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','pending_dealer_approval','confirmed','dispatched','in_transit','delivered','partially_delivered','cancelled','disputed'));

-- Migrate old status values to new ones
UPDATE orders SET status = 'dispatched' WHERE status = 'processing';
UPDATE orders SET status = 'in_transit' WHERE status = 'shipped';


-- ============ STEP 3: INVENTORY MIGRATION ============
-- Migration: Add inventory tables and order fulfillment columns
-- Run: psql -U postgres -d material_king -f src/scripts/migrate-inventory.sql

-- Add expected_delivery_date to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;

-- Add fulfillment columns to order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(30) DEFAULT 'in_stock';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity_back_order INT DEFAULT 0;

-- Inventory table (reorder levels per product)
CREATE TABLE IF NOT EXISTS inventory (
  id            SERIAL PRIMARY KEY,
  product_id    INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reorder_level INT NOT NULL DEFAULT 10,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id)
);

-- Inventory transactions (stock movement log)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id              SERIAL PRIMARY KEY,
  product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  transaction_type VARCHAR(30) NOT NULL
                  CHECK (transaction_type IN ('add','reduce','reserve','adjust')),
  quantity_change  INT NOT NULL,
  quantity_before  INT NOT NULL,
  quantity_after   INT NOT NULL,
  reason          TEXT,
  reference_type  VARCHAR(30),
  reference_id    VARCHAR(50),
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order status history (audit trail for state machine transitions)
CREATE TABLE IF NOT EXISTS order_status_history (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status VARCHAR(30),
  to_status   VARCHAR(30) NOT NULL,
  changed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_ref ON inventory_transactions(reference_type, reference_id);


-- ============ STEP 4: CART & ORDERS MIGRATION ============
-- Migration: Add cart_items table, payment columns to orders, seed coupons
-- Run: psql -U postgres -d material_king -f src/scripts/migrate-cart-orders.sql

-- 1. Cart items table
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

-- 2. Add payment columns to orders (safe — uses IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_method') THEN
    ALTER TABLE orders ADD COLUMN payment_method VARCHAR(30) NOT NULL DEFAULT 'cod';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_status') THEN
    ALTER TABLE orders ADD COLUMN payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid';
  END IF;
END $$;

-- 3. Seed coupons if not present
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, is_active) VALUES
  ('WELCOME10', '10% off on your first order', 'percentage', 10, 1000, 2000, NULL, true),
  ('FLAT500', 'Flat ₹500 off on orders above ₹5,000', 'fixed', 500, 5000, NULL, NULL, true),
  ('BULK15', '15% off on bulk orders above ₹25,000', 'percentage', 15, 25000, 5000, NULL, true),
  ('SAVE200', 'Flat ₹200 off on any order', 'fixed', 200, 500, NULL, 1000, true)
ON CONFLICT (code) DO NOTHING;


-- ============ STEP 5: SEED DATA ============
-- Material King - Seed Data
-- Categories, Subcategories, Brands, and Products
-- Run: psql -U postgres -d material_king -f src/scripts/seed-data.sql

-- ============================================================
-- BRANDS (16 major building material brands)
-- ============================================================
INSERT INTO brands (name, slug, is_active) VALUES
  ('Kajaria', 'kajaria', true),
  ('Somany', 'somany', true),
  ('Asian Paints', 'asian-paints', true),
  ('Berger Paints', 'berger-paints', true),
  ('Hindware', 'hindware', true),
  ('Cera', 'cera', true),
  ('Godrej', 'godrej', true),
  ('Havells', 'havells', true),
  ('Finolex', 'finolex', true),
  ('Century Plyboards', 'century-plyboards', true),
  ('Greenply', 'greenply', true),
  ('Ultratech Cement', 'ultratech-cement', true),
  ('ACC Cement', 'acc-cement', true),
  ('Crompton', 'crompton', true),
  ('Polycab', 'polycab', true),
  ('RAK Ceramics', 'rak-ceramics', true),
  ('Jaquar', 'jaquar', true),
  ('Anchor by Panasonic', 'anchor-panasonic', true),
  ('Astral Pipes', 'astral-pipes', true),
  ('Supreme Pipes', 'supreme-pipes', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PARENT CATEGORIES
-- ============================================================
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
  ('Tiles & Flooring', 'tiles-flooring', 'Floor tiles, wall tiles, vitrified, ceramic, and natural stone', NULL, true, 1),
  ('Paints & Coatings', 'paints-coatings', 'Interior paints, exterior paints, primers, and wood finishes', NULL, true, 2),
  ('Sanitaryware & Bath', 'sanitaryware-bath', 'Toilets, basins, faucets, showers, and bath accessories', NULL, true, 3),
  ('Hardware & Locks', 'hardware-locks', 'Door locks, handles, hinges, and security hardware', NULL, true, 4),
  ('Boards & Plywood', 'boards-plywood', 'Plywood, MDF, particle board, and laminates', NULL, true, 5),
  ('Electrical', 'electrical', 'Wires, cables, switches, MCBs, and electrical accessories', NULL, true, 6),
  ('Plumbing', 'plumbing', 'Pipes, fittings, valves, and water storage solutions', NULL, true, 7),
  ('Kitchen & Appliances', 'kitchen-appliances', 'Kitchen sinks, chimneys, hobs, and kitchen hardware', NULL, true, 8),
  ('Cement & Building', 'cement-building', 'Cement, TMT bars, ready mix, and construction chemicals', NULL, true, 9),
  ('Lighting', 'lighting', 'LED lights, panel lights, decorative lights, and outdoor lighting', NULL, true, 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SUBCATEGORIES
-- ============================================================
-- Tiles subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
  ('Floor Tiles', 'floor-tiles', 'Vitrified, ceramic, and porcelain floor tiles', (SELECT id FROM categories WHERE slug = 'tiles-flooring'), true, 1),
  ('Wall Tiles', 'wall-tiles', 'Ceramic and decorative wall tiles', (SELECT id FROM categories WHERE slug = 'tiles-flooring'), true, 2),
  ('Vitrified Tiles', 'vitrified-tiles', 'Double charge and glazed vitrified tiles', (SELECT id FROM categories WHERE slug = 'tiles-flooring'), true, 3),
  ('Outdoor Tiles', 'outdoor-tiles', 'Parking, pathway, and terrace tiles', (SELECT id FROM categories WHERE slug = 'tiles-flooring'), true, 4),
  ('Mosaic Tiles', 'mosaic-tiles', 'Decorative mosaic and art tiles', (SELECT id FROM categories WHERE slug = 'tiles-flooring'), true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Paints subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
  ('Interior Paints', 'interior-paints', 'Emulsion, distemper, and premium interior paints', (SELECT id FROM categories WHERE slug = 'paints-coatings'), true, 1),
  ('Exterior Paints', 'exterior-paints', 'Weather-proof and textured exterior paints', (SELECT id FROM categories WHERE slug = 'paints-coatings'), true, 2),
  ('Primers & Putty', 'primers-putty', 'Wall primers, putty, and surface preparation', (SELECT id FROM categories WHERE slug = 'paints-coatings'), true, 3),
  ('Wood Finishes', 'wood-finishes', 'Wood stains, varnishes, and PU finishes', (SELECT id FROM categories WHERE slug = 'paints-coatings'), true, 4),
  ('Waterproofing', 'waterproofing', 'Waterproofing solutions and coatings', (SELECT id FROM categories WHERE slug = 'paints-coatings'), true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Sanitaryware subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
  ('Toilets & WC', 'toilets-wc', 'Western toilets, wall-hung, and EWC', (SELECT id FROM categories WHERE slug = 'sanitaryware-bath'), true, 1),
  ('Wash Basins', 'wash-basins', 'Counter-top, wall-mounted, and pedestal basins', (SELECT id FROM categories WHERE slug = 'sanitaryware-bath'), true, 2),
  ('Faucets & Taps', 'faucets-taps', 'Basin taps, shower mixers, and kitchen taps', (SELECT id FROM categories WHERE slug = 'sanitaryware-bath'), true, 3),
  ('Shower Systems', 'shower-systems', 'Rain showers, hand showers, and shower panels', (SELECT id FROM categories WHERE slug = 'sanitaryware-bath'), true, 4),
  ('Bath Accessories', 'bath-accessories', 'Towel rods, soap holders, and bathroom fittings', (SELECT id FROM categories WHERE slug = 'sanitaryware-bath'), true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Hardware subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
  ('Door Locks', 'door-locks', 'Mortice locks, digital locks, and padlocks', (SELECT id FROM categories WHERE slug = 'hardware-locks'), true, 1),
  ('Door Handles', 'door-handles', 'Lever handles, pull handles, and knobs', (SELECT id FROM categories WHERE slug = 'hardware-locks'), true, 2),
  ('Hinges', 'hinges', 'Butt hinges, concealed hinges, and floor springs', (SELECT id FROM categories WHERE slug = 'hardware-locks'), true, 3),
  ('Cabinet Hardware', 'cabinet-hardware', 'Drawer slides, handles, and kitchen fittings', (SELECT id FROM categories WHERE slug = 'hardware-locks'), true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Boards subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
  ('Plywood', 'plywood', 'BWP, BWR, and commercial plywood', (SELECT id FROM categories WHERE slug = 'boards-plywood'), true, 1),
  ('MDF Board', 'mdf-board', 'Plain and pre-laminated MDF', (SELECT id FROM categories WHERE slug = 'boards-plywood'), true, 2),
  ('Particle Board', 'particle-board', 'Plain and pre-laminated particle board', (SELECT id FROM categories WHERE slug = 'boards-plywood'), true, 3),
  ('Laminates', 'laminates', 'Decorative laminates and HPL sheets', (SELECT id FROM categories WHERE slug = 'boards-plywood'), true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Electrical subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
  ('Wires & Cables', 'wires-cables', 'House wires, flexible cables, and armored cables', (SELECT id FROM categories WHERE slug = 'electrical'), true, 1),
  ('Switches & Sockets', 'switches-sockets', 'Modular switches, sockets, and switch plates', (SELECT id FROM categories WHERE slug = 'electrical'), true, 2),
  ('MCB & Distribution', 'mcb-distribution', 'MCBs, RCCBs, and distribution boards', (SELECT id FROM categories WHERE slug = 'electrical'), true, 3),
  ('Fans', 'fans', 'Ceiling fans, exhaust fans, and table fans', (SELECT id FROM categories WHERE slug = 'electrical'), true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Plumbing subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
  ('CPVC Pipes', 'cpvc-pipes', 'Hot and cold water CPVC piping systems', (SELECT id FROM categories WHERE slug = 'plumbing'), true, 1),
  ('PVC Pipes', 'pvc-pipes', 'SWR, drainage, and agricultural PVC pipes', (SELECT id FROM categories WHERE slug = 'plumbing'), true, 2),
  ('Pipe Fittings', 'pipe-fittings', 'Elbows, tees, couplers, and valves', (SELECT id FROM categories WHERE slug = 'plumbing'), true, 3),
  ('Water Tanks', 'water-tanks', 'Overhead and underground water storage tanks', (SELECT id FROM categories WHERE slug = 'plumbing'), true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Kitchen subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
  ('Kitchen Sinks', 'kitchen-sinks', 'Stainless steel, granite, and quartz kitchen sinks', (SELECT id FROM categories WHERE slug = 'kitchen-appliances'), true, 1),
  ('Chimneys', 'chimneys', 'Auto-clean, baffle filter, and island chimneys', (SELECT id FROM categories WHERE slug = 'kitchen-appliances'), true, 2),
  ('Hobs & Cooktops', 'hobs-cooktops', 'Built-in gas hobs and induction cooktops', (SELECT id FROM categories WHERE slug = 'kitchen-appliances'), true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Cement subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
  ('OPC Cement', 'opc-cement', 'Ordinary Portland Cement 43 & 53 grade', (SELECT id FROM categories WHERE slug = 'cement-building'), true, 1),
  ('PPC Cement', 'ppc-cement', 'Portland Pozzolana Cement', (SELECT id FROM categories WHERE slug = 'cement-building'), true, 2),
  ('TMT Bars', 'tmt-bars', 'Fe500 and Fe500D TMT reinforcement bars', (SELECT id FROM categories WHERE slug = 'cement-building'), true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Lighting subcategories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
  ('LED Bulbs', 'led-bulbs', 'LED bulbs and tube lights', (SELECT id FROM categories WHERE slug = 'lighting'), true, 1),
  ('Panel Lights', 'panel-lights', 'Slim and surface mount LED panel lights', (SELECT id FROM categories WHERE slug = 'lighting'), true, 2),
  ('Decorative Lights', 'decorative-lights', 'Chandeliers, pendants, and wall lights', (SELECT id FROM categories WHERE slug = 'lighting'), true, 3),
  ('Outdoor Lights', 'outdoor-lights', 'Flood lights, bollard lights, and garden lights', (SELECT id FROM categories WHERE slug = 'lighting'), true, 4)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- PRODUCTS (5-10 per parent category, linked to subcategories)
-- ============================================================

-- ---- TILES & FLOORING ----
INSERT INTO products (name, slug, sku, category_id, brand_id, unit, price, mrp, stock_qty, min_order_qty, description, material, colour, grade, length_mm, breadth_mm, thickness_mm, weight_kg, hsn_code, country_of_origin, warranty, is_active) VALUES
(
  'Polished Vitrified Floor Tile 600x600mm - Marble White',
  'kajaria-pvt-600-marble-white', 'KAJ-VIT-MW-600',
  (SELECT id FROM categories WHERE slug = 'floor-tiles'),
  (SELECT id FROM brands WHERE slug = 'kajaria'),
  'sq.ft', 45, 53, 5000, 100,
  'Premium double-charged polished vitrified tile with marble white finish. Ideal for living rooms, bedrooms, and commercial spaces. High gloss finish with excellent stain resistance.',
  'Vitrified', 'Marble White', 'Premium', 600, 600, 9.5, 1.8, '6907', 'India', '5 years', true
),
(
  'GVT Digital Print Wood Plank 200x1200mm - Autumn Oak',
  'kajaria-gvt-wood-autumn-oak', 'KAJ-GVT-AO-1200',
  (SELECT id FROM categories WHERE slug = 'floor-tiles'),
  (SELECT id FROM brands WHERE slug = 'kajaria'),
  'sq.ft', 72, 85, 3000, 50,
  'Wood-look glazed vitrified tile with realistic oak texture. Anti-skid surface, ideal for modern interiors.',
  'Vitrified', 'Autumn Oak', 'Premium', 200, 1200, 10, 2.1, '6907', 'India', '5 years', true
),
(
  'Matt Finish Ceramic Wall Tile 300x600mm - Ivory',
  'somany-ceramic-wall-ivory', 'SOM-CWT-IV-3060',
  (SELECT id FROM categories WHERE slug = 'wall-tiles'),
  (SELECT id FROM brands WHERE slug = 'somany'),
  'sq.ft', 32, 40, 8000, 100,
  'Smooth matt finish ceramic wall tile in ivory shade. Perfect for kitchen and bathroom walls. Easy to clean and maintain.',
  'Ceramic', 'Ivory', 'Standard', 300, 600, 8, 1.2, '6908', 'India', '3 years', true
),
(
  'Digital HD Print Wall Tile 300x450mm - Marble Brown',
  'somany-hd-wall-marble-brown', 'SOM-HDW-MB-3045',
  (SELECT id FROM categories WHERE slug = 'wall-tiles'),
  (SELECT id FROM brands WHERE slug = 'somany'),
  'sq.ft', 28, 35, 6000, 100,
  'High-definition digital print wall tile with natural marble brown pattern. Moisture resistant and hygienic.',
  'Ceramic', 'Marble Brown', 'Standard', 300, 450, 7.5, 1.0, '6908', 'India', '3 years', true
),
(
  'Anti-Skid Parking Tile 300x300mm - Dark Grey',
  'kajaria-parking-dark-grey', 'KAJ-PKG-DG-300',
  (SELECT id FROM categories WHERE slug = 'outdoor-tiles'),
  (SELECT id FROM brands WHERE slug = 'kajaria'),
  'sq.ft', 38, 48, 4000, 100,
  'Heavy duty anti-skid parking tile with 12mm thickness. Suitable for car parkings, driveways, and industrial areas.',
  'Vitrified', 'Dark Grey', 'Heavy Duty', 300, 300, 12, 2.5, '6907', 'India', '10 years', true
),
(
  'Hexagonal Mosaic Tile Sheet - Carrara White',
  'rak-mosaic-hex-carrara', 'RAK-MOS-HX-CW',
  (SELECT id FROM categories WHERE slug = 'mosaic-tiles'),
  (SELECT id FROM brands WHERE slug = 'rak-ceramics'),
  'sq.ft', 120, 150, 1500, 20,
  'Premium hexagonal mosaic tile on mesh backing. Perfect for bathroom floors, feature walls, and kitchen backsplashes.',
  'Porcelain', 'Carrara White', 'Premium', 300, 300, 6, 0.8, '6907', 'India', '5 years', true
),
(
  'Double Charge Vitrified Tile 800x800mm - Bottochino',
  'kajaria-dc-800-bottochino', 'KAJ-DC-BOT-800',
  (SELECT id FROM categories WHERE slug = 'vitrified-tiles'),
  (SELECT id FROM brands WHERE slug = 'kajaria'),
  'sq.ft', 65, 78, 3500, 50,
  'Large format double charge vitrified tile with Bottochino marble effect. Full body color for long-lasting beauty.',
  'Vitrified', 'Bottochino', 'Premium', 800, 800, 10, 3.2, '6907', 'India', '10 years', true
),

-- ---- PAINTS & COATINGS ----
(
  'Royale Luxury Emulsion Interior Paint - 20 Litre',
  'asian-paints-royale-20l', 'AP-RYL-INT-20L',
  (SELECT id FROM categories WHERE slug = 'interior-paints'),
  (SELECT id FROM brands WHERE slug = 'asian-paints'),
  'bucket', 5850, 6500, 200, 1,
  'Premium luxury emulsion paint with Teflon surface protector. Stain-resistant, washable finish with silk-like sheen. Coverage: 120-140 sq.ft per litre.',
  'Acrylic Emulsion', 'White', 'Premium', NULL, NULL, NULL, 28, '3209', 'India', '5 years', true
),
(
  'Apex Ultima Exterior Emulsion - 20 Litre',
  'asian-paints-apex-ultima-20l', 'AP-APX-EXT-20L',
  (SELECT id FROM categories WHERE slug = 'exterior-paints'),
  (SELECT id FROM brands WHERE slug = 'asian-paints'),
  'bucket', 4850, 5700, 300, 1,
  'Weather-proof exterior emulsion with anti-algal technology. UV resistant with dust-proof finish. Coverage: 90-110 sq.ft per litre.',
  'Acrylic Emulsion', 'White', 'Premium', NULL, NULL, NULL, 30, '3209', 'India', '7 years', true
),
(
  'WeatherCoat All Guard Exterior Paint - 10 Litre',
  'berger-weathercoat-10l', 'BRG-WCT-EXT-10L',
  (SELECT id FROM categories WHERE slug = 'exterior-paints'),
  (SELECT id FROM brands WHERE slug = 'berger-paints'),
  'bucket', 2950, 3400, 250, 1,
  'All-weather exterior paint with anti-fungal and anti-algal properties. Excellent color retention and durability.',
  'Acrylic Emulsion', 'White', 'Standard', NULL, NULL, NULL, 15, '3209', 'India', '5 years', true
),
(
  'Damp Block Waterproofing Solution - 20 Kg',
  'asian-paints-dampblock-20kg', 'AP-DMP-WP-20KG',
  (SELECT id FROM categories WHERE slug = 'waterproofing'),
  (SELECT id FROM brands WHERE slug = 'asian-paints'),
  'bucket', 3200, 3800, 150, 1,
  'Acrylic-based flexible waterproofing coating for terraces, external walls, and bathrooms. Bridges hairline cracks.',
  'Acrylic Polymer', 'Grey', NULL, NULL, NULL, NULL, 20, '3214', 'India', '5 years', true
),
(
  'Wall Primer Water Based - 20 Litre',
  'berger-primer-wb-20l', 'BRG-PRM-WB-20L',
  (SELECT id FROM categories WHERE slug = 'primers-putty'),
  (SELECT id FROM brands WHERE slug = 'berger-paints'),
  'bucket', 1850, 2200, 400, 1,
  'Water-based wall primer for interior surfaces. Provides excellent adhesion for topcoats and ensures uniform paint finish.',
  'Acrylic', 'White', NULL, NULL, NULL, NULL, 26, '3209', 'India', NULL, true
),
(
  'Silk Glamor Interior Emulsion - 10 Litre',
  'berger-silk-glamor-10l', 'BRG-SLK-INT-10L',
  (SELECT id FROM categories WHERE slug = 'interior-paints'),
  (SELECT id FROM brands WHERE slug = 'berger-paints'),
  'bucket', 3200, 3800, 180, 1,
  'Premium interior emulsion with silk sheen finish. Stain-proof and washable. Low VOC formula for healthy interiors.',
  'Acrylic Emulsion', 'White', 'Premium', NULL, NULL, NULL, 14, '3209', 'India', '5 years', true
),
(
  'Melamyne Wood Finish - 4 Litre',
  'asian-paints-melamyne-4l', 'AP-MLM-WF-4L',
  (SELECT id FROM categories WHERE slug = 'wood-finishes'),
  (SELECT id FROM brands WHERE slug = 'asian-paints'),
  'piece', 1450, 1700, 120, 1,
  'High gloss melamine wood finish for furniture and doors. Crystal clear transparent coating that enhances wood grain.',
  'Melamine', 'Clear', NULL, NULL, NULL, NULL, 5.5, '3208', 'India', NULL, true
),

-- ---- SANITARYWARE & BATH ----
(
  'Enigma One-Piece Rimless Toilet with Soft Close Seat',
  'hindware-enigma-toilet', 'HW-ENG-TP-01',
  (SELECT id FROM categories WHERE slug = 'toilets-wc'),
  (SELECT id FROM brands WHERE slug = 'hindware'),
  'piece', 12500, 15000, 50, 1,
  'Premium one-piece rimless toilet with S-trap. Dual flush (3L/6L), soft close seat, and anti-bacterial glaze. Easy-clean design with concealed trapway.',
  'Ceramic', 'Star White', 'Premium', 700, 370, NULL, 35, '6910', 'India', '10 years', true
),
(
  'EWC Wall Hung Toilet with Frame',
  'cera-ewc-wallhung', 'CERA-WH-EWC-01',
  (SELECT id FROM categories WHERE slug = 'toilets-wc'),
  (SELECT id FROM brands WHERE slug = 'cera'),
  'piece', 8900, 11000, 35, 1,
  'Modern wall-hung EWC with concealed cistern frame. Space-saving design with dual flush and soft close seat.',
  'Ceramic', 'Snow White', 'Premium', 540, 360, NULL, 25, '6910', 'India', '7 years', true
),
(
  'Counter-Top Art Basin 600mm - Round',
  'hindware-art-basin-round', 'HW-CTB-RND-600',
  (SELECT id FROM categories WHERE slug = 'wash-basins'),
  (SELECT id FROM brands WHERE slug = 'hindware'),
  'piece', 4500, 5500, 80, 1,
  'Designer counter-top art basin with rounded edges. Premium ceramic with anti-stain glaze. Includes waste coupling.',
  'Ceramic', 'White', 'Premium', 600, 420, NULL, 12, '6910', 'India', '5 years', true
),
(
  'Single Lever Basin Mixer - Chrome',
  'jaquar-basin-mixer-chrome', 'JAQ-BM-CHR-01',
  (SELECT id FROM categories WHERE slug = 'faucets-taps'),
  (SELECT id FROM brands WHERE slug = 'jaquar'),
  'piece', 3800, 4600, 120, 1,
  'Premium single lever basin mixer with ceramic cartridge. Quarter-turn operation with hot and cold mixing. Chrome plated brass body.',
  'Brass Chrome', 'Chrome', 'Premium', NULL, NULL, NULL, 1.2, '8481', 'India', '7 years', true
),
(
  'Overhead Rain Shower 200mm with Arm',
  'jaquar-rain-shower-200', 'JAQ-RS-200-ARM',
  (SELECT id FROM categories WHERE slug = 'shower-systems'),
  (SELECT id FROM brands WHERE slug = 'jaquar'),
  'piece', 5200, 6500, 60, 1,
  '200mm round rain shower head with 450mm shower arm. Full stainless steel construction with anti-lime system.',
  'Stainless Steel', 'Chrome', 'Premium', 200, 200, NULL, 1.5, '8481', 'India', '5 years', true
),
(
  'Towel Rod 24 Inch - Stainless Steel',
  'hindware-towel-rod-24', 'HW-TR-SS-24',
  (SELECT id FROM categories WHERE slug = 'bath-accessories'),
  (SELECT id FROM brands WHERE slug = 'hindware'),
  'piece', 850, 1100, 200, 1,
  '24-inch stainless steel towel rod with concealed mounting. Rust-proof and scratch-resistant finish.',
  'Stainless Steel 304', 'Chrome', 'Standard', 600, NULL, NULL, 0.5, '7324', 'India', '3 years', true
),

-- ---- HARDWARE & LOCKS ----
(
  '7 Lever Deadbolt Door Lock - Satin Steel',
  'godrej-7lever-deadbolt', 'GDJ-7LV-DB-SS',
  (SELECT id FROM categories WHERE slug = 'door-locks'),
  (SELECT id FROM brands WHERE slug = 'godrej'),
  'piece', 2350, 2800, 150, 1,
  '7-lever double action deadbolt lock with anti-pick pins. Hardened steel body with satin nickel finish. Comes with 3 computerized keys.',
  'Stainless Steel', 'Satin Steel', 'Premium', NULL, NULL, NULL, 0.8, '8301', 'India', '10 years', true
),
(
  'Digital Smart Lock - Fingerprint & Pin',
  'godrej-smart-lock-fp', 'GDJ-SML-FP-01',
  (SELECT id FROM categories WHERE slug = 'door-locks'),
  (SELECT id FROM brands WHERE slug = 'godrej'),
  'piece', 12500, 15000, 30, 1,
  'Smart digital door lock with fingerprint, PIN, RFID card, and emergency key access. Auto-lock feature with audit trail.',
  'Zinc Alloy', 'Black', 'Premium', NULL, NULL, NULL, 3.2, '8301', 'India', '2 years', true
),
(
  'Premium Mortise Handle Set - Rose Gold',
  'godrej-mortise-rosegold', 'GDJ-MH-RG-01',
  (SELECT id FROM categories WHERE slug = 'door-handles'),
  (SELECT id FROM brands WHERE slug = 'godrej'),
  'piece', 1850, 2200, 100, 1,
  'Premium zinc alloy mortise handle with rose gold PVD finish. Elegant design suitable for main doors and bedrooms.',
  'Zinc Alloy', 'Rose Gold', 'Premium', NULL, NULL, NULL, 1.0, '8302', 'India', '5 years', true
),
(
  'Concealed Hinge Soft Close - Pair',
  'godrej-hinge-softclose', 'GDJ-HNG-SC-PR',
  (SELECT id FROM categories WHERE slug = 'hinges'),
  (SELECT id FROM brands WHERE slug = 'godrej'),
  'piece', 280, 350, 500, 10,
  'Full overlay concealed hinge with hydraulic soft-close mechanism. 110° opening angle, clip-on mounting. Sold as pair.',
  'Cold Rolled Steel', 'Nickel', 'Standard', NULL, NULL, NULL, 0.3, '8302', 'India', '3 years', true
),
(
  'Telescopic Drawer Slide 18 Inch - Pair',
  'godrej-drawer-slide-18', 'GDJ-DS-18-PR',
  (SELECT id FROM categories WHERE slug = 'cabinet-hardware'),
  (SELECT id FROM brands WHERE slug = 'godrej'),
  'piece', 420, 520, 300, 5,
  'Ball bearing telescopic drawer slide with 45kg load capacity. Full extension with smooth glide operation. 18-inch length, sold as pair.',
  'Cold Rolled Steel', 'Zinc', 'Standard', NULL, NULL, NULL, 0.6, '8302', 'India', '3 years', true
),

-- ---- BOARDS & PLYWOOD ----
(
  '18mm BWP Marine Plywood 8x4 ft',
  'century-bwp-18mm-8x4', 'CEN-BWP-18-8X4',
  (SELECT id FROM categories WHERE slug = 'plywood'),
  (SELECT id FROM brands WHERE slug = 'century-plyboards'),
  'piece', 4200, 4800, 200, 1,
  '18mm boiling water proof marine grade plywood. IS:710 certified. Suitable for kitchen cabinets, bathrooms, and exterior furniture.',
  'Hardwood', 'Natural', 'BWP Marine', 2440, 1220, 18, 28, '4412', 'India', '25 years', true
),
(
  '19mm BWR Commercial Plywood 8x4 ft',
  'greenply-bwr-19mm-8x4', 'GRP-BWR-19-8X4',
  (SELECT id FROM categories WHERE slug = 'plywood'),
  (SELECT id FROM brands WHERE slug = 'greenply'),
  'piece', 2800, 3200, 300, 1,
  '19mm boiling water resistant plywood for interior furniture, wardrobes, and false ceilings. IS:303 certified.',
  'Hardwood', 'Natural', 'BWR', 2440, 1220, 19, 26, '4412', 'India', '15 years', true
),
(
  'Pre-Laminated MDF 18mm White - 8x4 ft',
  'century-mdf-18mm-white', 'CEN-MDF-18-WH',
  (SELECT id FROM categories WHERE slug = 'mdf-board'),
  (SELECT id FROM brands WHERE slug = 'century-plyboards'),
  'piece', 2200, 2600, 150, 1,
  'Pre-laminated MDF board with white matt finish on both sides. Ideal for modular furniture, shelving, and partitions.',
  'MDF', 'White', 'E1 Grade', 2440, 1220, 18, 32, '4411', 'India', NULL, true
),
(
  'Pre-Laminated Particle Board 16mm - 8x4 ft',
  'greenply-pb-16mm', 'GRP-PB-16-8X4',
  (SELECT id FROM categories WHERE slug = 'particle-board'),
  (SELECT id FROM brands WHERE slug = 'greenply'),
  'piece', 1100, 1350, 250, 1,
  '16mm pre-laminated particle board for budget furniture and office partitions. Available in multiple finishes.',
  'Particle Board', 'Walnut', 'Standard', 2440, 1220, 16, 30, '4410', 'India', NULL, true
),
(
  'High Pressure Decorative Laminate 1mm - 8x4 ft',
  'century-hpl-1mm', 'CEN-HPL-1MM-8X4',
  (SELECT id FROM categories WHERE slug = 'laminates'),
  (SELECT id FROM brands WHERE slug = 'century-plyboards'),
  'piece', 950, 1200, 400, 5,
  '1mm thick high-pressure decorative laminate sheet. Scratch resistant, heat resistant surface. Available in 200+ designs.',
  'HPL', 'Teak', 'Premium', 2440, 1220, 1, 4, '4823', 'India', NULL, true
),

-- ---- ELECTRICAL ----
(
  'Lifeline Plus FR House Wire 1.5 sq mm - 90m Coil',
  'havells-lifeline-1.5-90m', 'HAV-LLP-15-90M',
  (SELECT id FROM categories WHERE slug = 'wires-cables'),
  (SELECT id FROM brands WHERE slug = 'havells'),
  'roll', 1850, 2200, 500, 1,
  '1.5 sq mm single core PVC insulated copper house wire. Flame retardant (FR), 90-metre coil. IS:694 certified.',
  'Copper PVC', 'Red', 'FR', NULL, NULL, NULL, 2.8, '8544', 'India', '10 years', true
),
(
  'Lifeline Plus FR Wire 2.5 sq mm - 90m Coil',
  'havells-lifeline-2.5-90m', 'HAV-LLP-25-90M',
  (SELECT id FROM categories WHERE slug = 'wires-cables'),
  (SELECT id FROM brands WHERE slug = 'havells'),
  'roll', 2950, 3500, 400, 1,
  '2.5 sq mm single core copper wire. Flame retardant PVC insulation, 90-metre coil. Ideal for power circuits and sockets.',
  'Copper PVC', 'Blue', 'FR', NULL, NULL, NULL, 4.2, '8544', 'India', '10 years', true
),
(
  'Roma Modular Switch 6A - Pack of 20',
  'anchor-roma-switch-6a', 'ANC-ROM-SW-6A',
  (SELECT id FROM categories WHERE slug = 'switches-sockets'),
  (SELECT id FROM brands WHERE slug = 'anchor-panasonic'),
  'piece', 680, 800, 1000, 10,
  'Roma series 1-way modular switch 6A 250V. Durable polycarbonate construction with silver oxide contacts. Pack of 20 switches.',
  'Polycarbonate', 'White', NULL, NULL, NULL, NULL, 0.4, '8536', 'India', '3 years', true
),
(
  '63A SP MCB C-Curve',
  'havells-mcb-63a-sp', 'HAV-MCB-63A-SP',
  (SELECT id FROM categories WHERE slug = 'mcb-distribution'),
  (SELECT id FROM brands WHERE slug = 'havells'),
  'piece', 520, 650, 300, 1,
  '63-amp single pole miniature circuit breaker, C-curve. 10kA breaking capacity, DIN rail mounting. IS/IEC 60898 certified.',
  'Thermoplastic', 'Grey', NULL, NULL, NULL, NULL, 0.2, '8536', 'India', '2 years', true
),
(
  'ES 48 Ceiling Fan 1200mm - Brown',
  'crompton-es48-fan-1200', 'CRM-ES48-1200-BR',
  (SELECT id FROM categories WHERE slug = 'fans'),
  (SELECT id FROM brands WHERE slug = 'crompton'),
  'piece', 1650, 2000, 100, 1,
  '1200mm (48 inch) energy-saving ceiling fan with high air delivery. Powder coated finish with double ball bearings for silent operation.',
  'Steel & Aluminium', 'Brown', NULL, NULL, NULL, NULL, 4.5, '8414', 'India', '2 years', true
),
(
  'FR House Wire 1.0 sq mm - 90m Coil',
  'polycab-fr-1.0-90m', 'PLY-FR-10-90M',
  (SELECT id FROM categories WHERE slug = 'wires-cables'),
  (SELECT id FROM brands WHERE slug = 'polycab'),
  'roll', 1450, 1700, 600, 1,
  '1.0 sq mm single core flame retardant copper wire. 90-metre coil. Ideal for lighting circuits.',
  'Copper PVC', 'Green', 'FR', NULL, NULL, NULL, 2.0, '8544', 'India', '10 years', true
),

-- ---- PLUMBING ----
(
  'CPVC Pro Pipe 15mm (1/2") - 3m Length',
  'astral-cpvc-15mm-3m', 'AST-CPVC-15-3M',
  (SELECT id FROM categories WHERE slug = 'cpvc-pipes'),
  (SELECT id FROM brands WHERE slug = 'astral-pipes'),
  'piece', 165, 200, 2000, 10,
  '15mm CPVC hot and cold water pipe, 3-metre length. SDR-11 rated for up to 93°C. Lead-free and corrosion resistant.',
  'CPVC', 'Light Yellow', NULL, NULL, NULL, NULL, 0.3, '3917', 'India', '25 years', true
),
(
  'SWR Drainage Pipe 110mm - 3m Length',
  'supreme-swr-110mm-3m', 'SUP-SWR-110-3M',
  (SELECT id FROM categories WHERE slug = 'pvc-pipes'),
  (SELECT id FROM brands WHERE slug = 'supreme-pipes'),
  'piece', 480, 580, 800, 5,
  '110mm soil, waste, and rainwater PVC pipe. 3-metre length. Self-extinguishing, UV stabilized. IS:13592 certified.',
  'PVC', 'Grey', NULL, NULL, NULL, NULL, 2.8, '3917', 'India', '10 years', true
),
(
  'CPVC Elbow 15mm 90° - Pack of 25',
  'astral-cpvc-elbow-15mm', 'AST-CPV-ELB-15',
  (SELECT id FROM categories WHERE slug = 'pipe-fittings'),
  (SELECT id FROM brands WHERE slug = 'astral-pipes'),
  'piece', 450, 550, 1500, 25,
  '15mm CPVC 90-degree elbow fitting. Solvent cement jointing. Pack of 25 pieces for plumbing installations.',
  'CPVC', 'Light Yellow', NULL, NULL, NULL, NULL, 0.8, '3917', 'India', '25 years', true
),
(
  'Triple Layer Water Tank 1000 Litre',
  'supreme-water-tank-1000l', 'SUP-WT-1000L',
  (SELECT id FROM categories WHERE slug = 'water-tanks'),
  (SELECT id FROM brands WHERE slug = 'supreme-pipes'),
  'piece', 5800, 6800, 50, 1,
  '1000-litre triple layer overhead water tank. UV stabilized outer layer, food-grade inner layer. Anti-bacterial protection.',
  'LLDPE', 'White', NULL, NULL, NULL, NULL, 18, '3925', 'India', '5 years', true
),
(
  'UPVC Plumbing Pipe 25mm - 6m Length',
  'astral-upvc-25mm-6m', 'AST-UPVC-25-6M',
  (SELECT id FROM categories WHERE slug = 'pvc-pipes'),
  (SELECT id FROM brands WHERE slug = 'astral-pipes'),
  'piece', 220, 280, 1200, 10,
  '25mm UPVC pressure pipe for cold water supply. 6-metre length. Solvent cement jointing. IS:4985 certified.',
  'UPVC', 'Blue', NULL, NULL, NULL, NULL, 1.2, '3917', 'India', '25 years', true
),

-- ---- KITCHEN & APPLIANCES ----
(
  'Double Bowl Stainless Steel Kitchen Sink 37x18 Inch',
  'hindware-double-sink-37x18', 'HW-KS-DB-3718',
  (SELECT id FROM categories WHERE slug = 'kitchen-sinks'),
  (SELECT id FROM brands WHERE slug = 'hindware'),
  'piece', 6500, 7800, 40, 1,
  '37x18 inch double bowl kitchen sink in 304 grade stainless steel. 1mm sheet thickness with satin finish. Includes waste coupling and drainer.',
  'Stainless Steel 304', 'Satin', 'Premium', 940, 460, NULL, 8, '7324', 'India', '10 years', true
),
(
  'Auto Clean Chimney 90cm - 1200 m³/hr',
  'hindware-chimney-autocl-90', 'HW-CH-AC-90',
  (SELECT id FROM categories WHERE slug = 'chimneys'),
  (SELECT id FROM brands WHERE slug = 'hindware'),
  'piece', 14500, 18000, 25, 1,
  '90cm auto-clean kitchen chimney with 1200 m³/hr suction capacity. Baffle filter, LED lights, and touch control panel.',
  'Stainless Steel', 'Black', 'Premium', 900, 480, 480, 18, '8414', 'India', '5 years', true
),
(
  'Built-in 4 Burner Gas Hob - Toughened Glass',
  'hindware-hob-4b-glass', 'HW-HOB-4B-TG',
  (SELECT id FROM categories WHERE slug = 'hobs-cooktops'),
  (SELECT id FROM brands WHERE slug = 'hindware'),
  'piece', 8500, 10500, 30, 1,
  'Built-in 4-burner gas hob with toughened glass top. Auto ignition with flame failure device. Heavy duty pan supports.',
  'Toughened Glass', 'Black', 'Premium', 600, 520, NULL, 10, '7321', 'India', '2 years', true
),

-- ---- CEMENT & BUILDING ----
(
  'UltraTech OPC 53 Grade Cement - 50 Kg Bag',
  'ultratech-opc-53-50kg', 'UTC-OPC-53-50KG',
  (SELECT id FROM categories WHERE slug = 'opc-cement'),
  (SELECT id FROM brands WHERE slug = 'ultratech-cement'),
  'bag', 380, 420, 10000, 50,
  'OPC 53 grade cement for high strength concrete, RCC work, and precast elements. IS:12269 certified. Consistent quality with superior strength.',
  'OPC', 'Grey', '53 Grade', NULL, NULL, NULL, 50, '2523', 'India', NULL, true
),
(
  'ACC Gold PPC Cement - 50 Kg Bag',
  'acc-ppc-gold-50kg', 'ACC-PPC-GLD-50KG',
  (SELECT id FROM categories WHERE slug = 'ppc-cement'),
  (SELECT id FROM brands WHERE slug = 'acc-cement'),
  'bag', 360, 400, 8000, 50,
  'Portland Pozzolana Cement with superior workability. Ideal for all general construction, plastering, and masonry work. IS:1489 certified.',
  'PPC', 'Grey', 'PPC', NULL, NULL, NULL, 50, '2523', 'India', NULL, true
),
(
  'UltraTech PPC Cement - 50 Kg Bag',
  'ultratech-ppc-50kg', 'UTC-PPC-50KG',
  (SELECT id FROM categories WHERE slug = 'ppc-cement'),
  (SELECT id FROM brands WHERE slug = 'ultratech-cement'),
  'bag', 370, 410, 9000, 50,
  'Premium Portland Pozzolana Cement for general construction. Excellent for plastering, flooring, and masonry. Lower heat of hydration.',
  'PPC', 'Grey', 'PPC', NULL, NULL, NULL, 50, '2523', 'India', NULL, true
),
(
  'Fe500D TMT Bar 12mm - Per Kg',
  'ultratech-tmt-12mm', 'UTC-TMT-12MM-KG',
  (SELECT id FROM categories WHERE slug = 'tmt-bars'),
  (SELECT id FROM brands WHERE slug = 'ultratech-cement'),
  'kg', 62, 70, 50000, 100,
  'Fe500D grade TMT reinforcement bar, 12mm diameter. Superior ductility and weldability. BIS certified, earthquake resistant.',
  'Steel', NULL, 'Fe500D', NULL, NULL, NULL, 1, '7214', 'India', NULL, true
),
(
  'ACC Concrete Plus PPC - 50 Kg Bag',
  'acc-concrete-plus-50kg', 'ACC-CP-50KG',
  (SELECT id FROM categories WHERE slug = 'ppc-cement'),
  (SELECT id FROM brands WHERE slug = 'acc-cement'),
  'bag', 385, 430, 5000, 50,
  'Premium PPC cement with superior concrete performance. Enhanced workability and durability for structural applications.',
  'PPC', 'Grey', 'PPC', NULL, NULL, NULL, 50, '2523', 'India', NULL, true
),

-- ---- LIGHTING ----
(
  'LED Bulb 12W B22 Cool Day Light - Pack of 10',
  'havells-led-12w-b22-10pk', 'HAV-LED-12W-B22',
  (SELECT id FROM categories WHERE slug = 'led-bulbs'),
  (SELECT id FROM brands WHERE slug = 'havells'),
  'piece', 850, 1100, 500, 1,
  '12-watt LED bulb with B22 base. 1200 lumens, cool daylight 6500K. Energy-efficient with 25,000 hours lifespan. Pack of 10.',
  'Polycarbonate', 'White', NULL, NULL, NULL, NULL, 0.8, '9405', 'India', '2 years', true
),
(
  'LED Slim Panel Light 18W Round - Surface Mount',
  'crompton-panel-18w-round', 'CRM-PNL-18W-RND',
  (SELECT id FROM categories WHERE slug = 'panel-lights'),
  (SELECT id FROM brands WHERE slug = 'crompton'),
  'piece', 480, 600, 200, 1,
  '18W surface mount round LED panel light. 1500 lumens, cool white 6000K. Slim profile 22mm, 225mm diameter. No false ceiling needed.',
  'Aluminium Die-Cast', 'White', NULL, NULL, NULL, NULL, 0.5, '9405', 'India', '2 years', true
),
(
  'Decorative Pendant Light - Modern Globe',
  'havells-pendant-globe', 'HAV-DPL-GLB-01',
  (SELECT id FROM categories WHERE slug = 'decorative-lights'),
  (SELECT id FROM brands WHERE slug = 'havells'),
  'piece', 2800, 3500, 40, 1,
  'Modern globe pendant light with frosted glass shade. E27 base (bulb not included). Adjustable cord length up to 1.5m.',
  'Glass & Metal', 'Black Gold', NULL, NULL, NULL, NULL, 2.0, '9405', 'India', '1 year', true
),
(
  '30W LED Flood Light - IP65 Outdoor',
  'havells-flood-30w', 'HAV-FLD-30W-IP65',
  (SELECT id FROM categories WHERE slug = 'outdoor-lights'),
  (SELECT id FROM brands WHERE slug = 'havells'),
  'piece', 950, 1200, 150, 1,
  '30W LED flood light with IP65 rating for outdoor use. 3000 lumens, cool daylight. Die-cast aluminium body with tempered glass.',
  'Aluminium Die-Cast', 'Grey', NULL, NULL, NULL, NULL, 1.0, '9405', 'India', '2 years', true
),
(
  'LED Tube Light T5 22W 4ft - Pack of 6',
  'crompton-tubelight-t5-22w', 'CRM-TL-T5-22W-6',
  (SELECT id FROM categories WHERE slug = 'led-bulbs'),
  (SELECT id FROM brands WHERE slug = 'crompton'),
  'piece', 1650, 2000, 300, 1,
  '22W T5 LED tube light, 4-feet length. 2200 lumens with diffused light. Direct replacement for conventional tube lights. Pack of 6.',
  'Polycarbonate', 'White', NULL, NULL, NULL, NULL, 1.2, '9405', 'India', '2 years', true
)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- COUPONS (sample discount coupons)
-- ============================================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, is_active) VALUES
  ('WELCOME10', '10% off on your first order', 'percentage', 10, 1000, 2000, NULL, true),
  ('FLAT500', 'Flat ₹500 off on orders above ₹5,000', 'fixed', 500, 5000, NULL, NULL, true),
  ('BULK15', '15% off on bulk orders above ₹25,000', 'percentage', 15, 25000, 5000, NULL, true),
  ('SAVE200', 'Flat ₹200 off on any order', 'fixed', 200, 500, NULL, 1000, true)
ON CONFLICT (code) DO NOTHING;


-- ============ STEP 6: BACKFILL RECORDS ============
-- Backfill: create buyers/vendors/dealers records for users who registered
-- but don't have a corresponding entity record yet.
-- Run: psql -U postgres -d material_king -f src/scripts/backfill-entity-records.sql

-- Backfill buyers
INSERT INTO buyers (user_id, company_name, contact_name, email, phone, is_active)
SELECT u.id, u.first_name || ' ' || u.last_name, u.first_name || ' ' || u.last_name, u.email, u.phone, true
FROM users u
WHERE u.user_type = 'buyer'
  AND u.is_active = true
  AND NOT EXISTS (SELECT 1 FROM buyers b WHERE b.user_id = u.id);

-- Backfill vendors
INSERT INTO vendors (user_id, company_name, contact_name, email, phone, is_active, is_verified)
SELECT u.id, u.first_name || ' ' || u.last_name, u.first_name || ' ' || u.last_name, u.email, u.phone, true, false
FROM users u
WHERE u.user_type = 'vendor'
  AND u.is_active = true
  AND NOT EXISTS (SELECT 1 FROM vendors v WHERE v.user_id = u.id);

-- Backfill dealers
INSERT INTO dealers (user_id, company_name, contact_name, email, phone, is_active)
SELECT u.id, u.first_name || ' ' || u.last_name, u.first_name || ' ' || u.last_name, u.email, u.phone, true
FROM users u
WHERE u.user_type = 'dealer'
  AND u.is_active = true
  AND NOT EXISTS (SELECT 1 FROM dealers d WHERE d.user_id = u.id);
