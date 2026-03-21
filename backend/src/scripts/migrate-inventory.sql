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
