-- Seed branding config keys (login background, navbar logos, navbar title)
-- Run once to add default empty values to the config table.

INSERT INTO config (config_group, config_key, config_value, data_type)
VALUES
  ('general', 'login_bg_image', '""', 'string'),
  ('general', 'navbar_logo_url', '""', 'string'),
  ('general', 'navbar_secondary_logo_url', '""', 'string'),
  ('general', 'navbar_title', '""', 'string')
ON DUPLICATE KEY UPDATE config_value = config_value;
