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
