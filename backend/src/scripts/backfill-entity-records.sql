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
