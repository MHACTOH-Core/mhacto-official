-- ========================================================================
-- LEGACY: Branding config keys are now seeded by database.sql.
-- This file is kept for upgrading databases created before schema v3.
-- Safe to re-run — uses ON DUPLICATE KEY UPDATE.
-- ========================================================================

INSERT INTO config (config_group, config_key, config_value, data_type)
VALUES
  ('general', 'login_bg_image', '""', 'string'),
  ('general', 'navbar_logo_url', '""', 'string'),
  ('general', 'navbar_secondary_logo_url', '""', 'string'),
  ('general', 'navbar_title', '""', 'string'),
  ('general', 'maintenance_mode', 'false', 'boolean'),
  ('social', 'facebook_url', '""', 'string'),
  ('social', 'instagram_url', '""', 'string')
ON DUPLICATE KEY UPDATE config_value = config_value;
