-- ========================================================================
-- LEGACY MIGRATION: Add notification_prefs to users table.
-- schema.sql v3 already includes this column.
-- Only run this on databases created BEFORE schema v3.
-- ========================================================================
ALTER TABLE users
  ADD COLUMN notification_prefs JSON DEFAULT NULL COMMENT 'Per-user notification preferences'
  AFTER status;
