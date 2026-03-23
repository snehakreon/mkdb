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
