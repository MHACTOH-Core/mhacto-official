-- ========================================================================
-- LEGACY MIGRATION: Fix milestone table column typo.
-- schema.sql v3 already has correct column name.
-- Only run this on databases created BEFORE schema v3.
-- ========================================================================
ALTER TABLE milestone CHANGE COLUMN updates_at updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
