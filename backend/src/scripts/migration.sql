-- Migration: Add slug column to categories and brands tables
-- Run this after applying FullSchema.sql if the slug column doesn't exist

-- Add slug to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
UPDATE categories SET slug = LOWER(REPLACE(category_name, ' ', '-')) WHERE slug IS NULL;

-- Add slug to brands
ALTER TABLE brands ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
UPDATE brands SET slug = LOWER(REPLACE(brand_name, ' ', '-')) WHERE slug IS NULL;
