-- Add notification_prefs column to users table (Phase 8)
ALTER TABLE users
  ADD COLUMN notification_prefs JSON DEFAULT NULL COMMENT 'Per-user notification preferences'
  AFTER status;
