-- ========================================================================
-- MHACTO Database Schema — mhacto_db
-- Bocaue, Bulacan — Municipal History, Arts, Culture & Tourism Office
--
-- Usage (fresh install):
--   mysql -u root -p < database-schema.sql
--
-- After import, run seed.sql to populate test / sample data:
--   mysql -u root -p mhacto_db < seed.sql
--
-- Tables (12 — confirmed plural naming convention):
--   1.  users
--   2.  config
--   3.  categories
--   4.  content
--   5.  content_fields
--   6.  content_images
--   7.  featured_content
--   8.  inquiries
--   9.  activity_logs
--   10. milestones
--   11. page_views
--   12. tour_guides
-- ========================================================================

-- ────────────────────────────────────────────────────────────────
-- DATABASE SETUP
-- ────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS mhacto_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mhacto_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ────────────────────────────────────────────────────────────────
-- DROP EXISTING TABLES (clean slate)
-- ────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS page_views;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS tour_guides;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS featured_content;
DROP TABLE IF EXISTS content_images;
DROP TABLE IF EXISTS content_fields;
DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS config;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;


-- ========================================================================
-- TABLE DEFINITIONS
-- ========================================================================


-- ────────────────────────────────────────────────────────────────
-- 1. USERS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE users (
  user_id            INT AUTO_INCREMENT PRIMARY KEY,
  username           VARCHAR(100) DEFAULT NULL,
  full_name          VARCHAR(200) DEFAULT NULL      COMMENT 'Display name',
  profile_picture    VARCHAR(255) DEFAULT NULL       COMMENT 'Profile image URL',
  email              VARCHAR(255) NOT NULL,
  password_hash      VARCHAR(100) DEFAULT NULL,
  role               ENUM('super_admin','admin','content_manager') DEFAULT 'admin',
  status             ENUM('active','archived') DEFAULT 'active',
  notification_prefs JSON         DEFAULT NULL       COMMENT 'Per-user notification preferences',
  created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 2. CONFIG  (flexible key-value store for site settings)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE config (
  config_id    INT AUTO_INCREMENT PRIMARY KEY,
  config_group VARCHAR(50)  NOT NULL       COMMENT 'e.g., hero, general, social, page_hero_*',
  config_key   VARCHAR(100) NOT NULL       COMMENT 'e.g., contact_email, hero_title',
  config_value JSON         DEFAULT NULL   COMMENT 'Stores the actual value dynamically',
  data_type    VARCHAR(20)  DEFAULT 'string' COMMENT 'e.g., string, boolean, number',
  updated_by   INT          DEFAULT NULL,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL,
  UNIQUE KEY uq_group_key (config_group, config_key),
  INDEX idx_group (config_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 3. CATEGORIES  (broad category groups + sub-labels)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE categories (
  category_id   INT AUTO_INCREMENT PRIMARY KEY,
  parent_id     INT         DEFAULT NULL   COMMENT 'FK to parent category (for labels)',
  category_type ENUM('category','label') DEFAULT 'category',
  label_key     VARCHAR(50) DEFAULT NULL   COMMENT 'URL-safe key (labels only)',
  label_name    VARCHAR(50) NOT NULL       COMMENT 'Display name',
  color_code    VARCHAR(50) DEFAULT NULL   COMMENT 'Badge colour (categories only)',
  is_active     TINYINT(1)  DEFAULT 1,
  FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  INDEX idx_type      (category_type),
  INDEX idx_label_key (label_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 4. CONTENT  (CMS posts — place / news / event)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE content (
  content_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          DEFAULT NULL,
  category_id INT          DEFAULT NULL  COMMENT 'FK → category',
  title       VARCHAR(255) DEFAULT NULL,
  description TEXT         DEFAULT NULL,
  status      ENUM('draft','published','archived') DEFAULT 'draft',
  post_type   ENUM('place','news','event') DEFAULT 'place',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(user_id)        ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  INDEX idx_status    (status),
  INDEX idx_post_type (post_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 5. CONTENT_FIELDS  (dynamic key-value metadata per content)
--    UNIQUE index on (content_id, meta_key) so ON DUPLICATE KEY
--    UPDATE in PHP setMeta() works correctly.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE content_fields (
  meta_id    INT AUTO_INCREMENT PRIMARY KEY,
  content_id INT          NOT NULL,
  meta_key   VARCHAR(100) NOT NULL  COMMENT 'e.g., location, hours, news_date, label_key',
  meta_value TEXT         DEFAULT NULL COMMENT 'Value or JSON for complex data',
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE,
  UNIQUE INDEX idx_content_key (content_id, meta_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 6. CONTENT_IMAGES
-- ────────────────────────────────────────────────────────────────
CREATE TABLE content_images (
  image_id     INT AUTO_INCREMENT PRIMARY KEY,
  content_id   INT         DEFAULT NULL,
  image_url    VARCHAR(255) DEFAULT NULL,
  is_thumbnail TINYINT(1)  DEFAULT 0,
  sort_order   INT         DEFAULT 0,
  created_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE,
  INDEX idx_content (content_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 7. FEATURED_CONTENT  (homepage spotlight + landmarks carousel)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE featured_content (
  featured_id INT AUTO_INCREMENT PRIMARY KEY,
  content_id  INT         DEFAULT NULL  COMMENT 'FK → content.content_id',
  section     ENUM('spotlight','landmark') NOT NULL,
  sort_order  INT         DEFAULT 0,
  is_active   TINYINT(1)  DEFAULT 1,
  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE,
  INDEX idx_section_active (section, is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 8. INQUIRIES  (visitor forms — general, tour, walk-in, partnership)
--    inquiry_type is VARCHAR so new types can be added without migration.
--    Current types: general_contact | tour_booking | partnership | walk_in
-- ────────────────────────────────────────────────────────────────
CREATE TABLE inquiries (
  inquiry_id         INT AUTO_INCREMENT PRIMARY KEY,
  inquiry_type       VARCHAR(50)  DEFAULT 'general_contact' COMMENT 'general_contact | tour_booking | partnership | walk_in',
  full_name          VARCHAR(255) NOT NULL,
  tourist_name       VARCHAR(255) DEFAULT NULL  COMMENT 'Actual tour attendee if different from submitter',
  email_address      VARCHAR(255) NOT NULL,
  contact_number     VARCHAR(20)  DEFAULT NULL  COMMENT 'Supports country codes e.g. +63…',
  date_of_visit      DATE         DEFAULT NULL  COMMENT 'Visitor availability start (sortable)',
  number_of_pax      INT          DEFAULT NULL  COMMENT 'Aggregatable crowd volume',
  message            TEXT         DEFAULT NULL,
  additional_details JSON         DEFAULT NULL  COMMENT 'Contextual extras: school_name, company_name, dateToVisit, etc.',
  status             ENUM('unread','read','in_progress','assigned','confirmed','completed','cancelled','expired','archived','spam','trash') DEFAULT 'unread',
  assigned_to        VARCHAR(150) DEFAULT NULL  COMMENT 'Tourist guide name',
  confirmed_date     DATE         DEFAULT NULL  COMMENT 'Actual confirmed tour date set by admin',
  confirmed_by       VARCHAR(100) DEFAULT NULL  COMMENT 'Admin username who confirmed the tour',
  reply_text         TEXT         DEFAULT NULL  COMMENT 'Admin reply for in-app thread',
  replied_at         TIMESTAMP    DEFAULT NULL,
  replied_by         VARCHAR(100) DEFAULT NULL  COMMENT 'Admin username who replied',
  created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_type   (inquiry_type),
  INDEX idx_visit  (date_of_visit),
  INDEX idx_confirmed (confirmed_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 9. TOUR_GUIDES  (non-account tourist guide roster)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE tour_guides (
  guide_id     INT AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(200) NOT NULL,
  phone_number VARCHAR(20)  DEFAULT NULL,
  availability ENUM('available','unavailable','on_tour') DEFAULT 'available',
  is_active    TINYINT(1)   DEFAULT 1,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_availability (availability, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 10. ACTIVITY_LOGS
--     action VARCHAR(50) supports flexible action strings:
--     login, logout, page_view, create_post, update_post,
--     delete_post, publish_post, archive_post, reply_inquiry,
--     archive_inquiry, update_settings, etc.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE activity_logs (
  log_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          DEFAULT NULL  COMMENT 'NULL for public page_view events',
  content_id INT          DEFAULT NULL  COMMENT 'Related CMS content (optional)',
  action     VARCHAR(50)  DEFAULT NULL  COMMENT 'Action type: login, create_post, reply_inquiry, etc.',
  details    JSON         DEFAULT NULL  COMMENT 'Dynamic payload for action context',
  page_path  VARCHAR(255) DEFAULT NULL  COMMENT 'URL path (page_view events)',
  ip_address VARCHAR(45)  DEFAULT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_action  (action),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 10. MILESTONES  (heritage timeline, optionally linked to CMS content)
--     content_id links to a CMS post with label = timeline-of-events.
--     year and title are nullable (pulled from CMS when content_id set).
-- ────────────────────────────────────────────────────────────────
CREATE TABLE milestones (
  milestone_id INT AUTO_INCREMENT PRIMARY KEY,
  content_id   INT          DEFAULT NULL   COMMENT 'FK → content (timeline-of-events posts)',
  year         INT          DEFAULT NULL,
  title        VARCHAR(255) DEFAULT NULL,
  description  TEXT         DEFAULT NULL,
  detail       TEXT         DEFAULT NULL,
  side         ENUM('left','right') DEFAULT 'left' COMMENT 'Timeline side: alternates left/right',
  sort_order   INT          DEFAULT 0,
  is_active    TINYINT(1)   DEFAULT 1,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE SET NULL,
  INDEX idx_active_order (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 11. PAGE_VIEWS  (per-destination click analytics)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE page_views (
  view_id            INT AUTO_INCREMENT PRIMARY KEY,
  content_id         INT          NOT NULL          COMMENT 'FK → content (post_type = place)',
  visitor_session_id VARCHAR(100) DEFAULT NULL       COMMENT 'Optional client-generated session token',
  clicked_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE,
  INDEX idx_content (content_id),
  INDEX idx_clicked (clicked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ========================================================================
-- BASE SEED DATA
-- Admin users, categories, labels, and site config required for the app
-- to function. Run seed.sql afterwards for test / sample content.
-- ========================================================================


-- ── Admin users ───────────────────────────────────────────────
-- Passwords (bcrypt $2y$12$): admin123 / admin123 / admin123

INSERT INTO users (username, full_name, email, password_hash, role, status) VALUES
('admin', 'MHACTO Super Admin', 'mhacto.municipalityofbocaue@gmail.com',
 '$2y$12$bAccO9YaDEfSb0HO/TT5aeEZY3ehXExHqrYUPcxugQffxk5U7BmLG',
 'super_admin', 'active');

INSERT INTO users (username, full_name, email, password_hash, role, status) VALUES
('mhactoadmin', 'MHACTO Admin', 'admin@mhacto.gov.ph',
 '$2y$12$oXhkY.s8u5dIhk9YVC9IV.koc1OAQc8DmZ4wSZyQsMuvlAsveFNZG',
 'admin', 'active');

INSERT INTO users (username, full_name, email, password_hash, role, status) VALUES
('contentmgr', 'Content Manager', 'content@mhacto.gov.ph',
 '$2y$12$Id6pRjWKWgwQUWbhLJrFkeOWPfx/S6UaDQjUymQwZ1y0MZy1qacv6',
 'content_manager', 'active');


-- ── Categories (IDs 1–5) ──────────────────────────────────────

INSERT INTO category (category_type, label_key, label_name, color_code, is_active) VALUES
('category', NULL, 'History Wonders',        '#3b82f6', 1),
('category', NULL, 'Arts & Culture Wonders', '#10b981', 1),
('category', NULL, 'Tourist Wonders',        '#f59e0b', 1),
('category', NULL, 'News & Events',          '#ef4444', 1),
('category', NULL, 'Community',              '#6366f1', 1);


-- ── Labels under History (parent_id = 1) ──────────────────────

INSERT INTO category (parent_id, category_type, label_key, label_name, is_active) VALUES
(1, 'label', 'timeline-of-events', 'Timeline of Events', 1),
(1, 'label', 'notable-figures',    'Remarkable Persons',  1);


-- ── Labels under Arts & Culture (parent_id = 2) ──────────────

INSERT INTO category (parent_id, category_type, label_key, label_name, is_active) VALUES
(2, 'label', 'local-cuisine',      'Culinary Wonders',       1),
(2, 'label', 'festivals',          'Festivals',              1),
(2, 'label', 'cultural-practices', 'Cultural Practices',     1),
(2, 'label', 'crafts-artisan',     'Crafts & Artisan',       1),
(2, 'label', 'people-wonders',     'People & Wonders',       1),
(2, 'label', 'restaurants',        'Restaurants & Eateries', 1),
(2, 'label', 'local-business',     'Local Business',         1);


-- ── Labels under Tourist Destinations (parent_id = 3) ─────────

INSERT INTO category (parent_id, category_type, label_key, label_name, is_active) VALUES
(3, 'label', 'destinations',    'Destinations',    1),
(3, 'label', 'travel-tours',    'Travel Tours',    1),
(3, 'label', 'tourism-wonders', 'Tourism Wonders', 1);


-- ── Labels under News & Events (parent_id = 4) ───────────────

INSERT INTO category (parent_id, category_type, label_key, label_name, is_active) VALUES
(4, 'label', 'events', 'Events', 1),
(4, 'label', 'news',   'News',   1);


-- ── Labels under Community (parent_id = 5) ────────────────────

INSERT INTO category (parent_id, category_type, label_key, label_name, is_active) VALUES
(5, 'label', 'schools',   'Schools',   1),
(5, 'label', 'colleges',  'Colleges',  1),
(5, 'label', 'hospitals', 'Hospitals', 1),
(5, 'label', 'barangay',  'Barangay',  1),
(5, 'label', 'bocauenos', 'Bocauenos', 1);


-- ── Config: General settings ──────────────────────────────────

INSERT INTO config (config_group, config_key, config_value, data_type) VALUES
('general', 'site_name',                 '"MHACTO Bocaue"',                          'string'),
('general', 'site_description',          '"Municipal History, Arts, Culture & Tourism Office — Bocaue, Bulacan"', 'string'),
('general', 'contact_email',             '"mhacto@bocaue.gov.ph"',                   'string'),
('general', 'contact_phone',             '"(044) 123-4567"',                          'string'),
('general', 'office_address',            '"Municipal Hall, Bocaue, Bulacan 3018"',    'string'),
('general', 'site_logo_url',             'null',                                      'string'),
('general', 'notify_inquiries',          'true',                                      'boolean'),
('general', 'enable_analytics',          'true',                                      'boolean'),
('general', 'maintenance_mode',          'false',                                     'boolean'),
('general', 'login_bg_image',            '""',                                        'string'),
('general', 'navbar_logo_url',           '""',                                        'string'),
('general', 'navbar_secondary_logo_url', '""',                                        'string'),
('general', 'navbar_title',              '""',                                        'string');


-- ── Config: Social links ──────────────────────────────────────

INSERT INTO config (config_group, config_key, config_value, data_type) VALUES
('social', 'facebook_url',  '""', 'string'),
('social', 'instagram_url', '""', 'string');


-- ── Config: Hero settings ─────────────────────────────────────

INSERT INTO config (config_group, config_key, config_value, data_type) VALUES
('hero', 'hero_subtitle',     '"Bocaue, Bulacan"',                              'string'),
('hero', 'hero_title',        '"Explore The River"',                            'string'),
('hero', 'hero_highlight',    '"Town Wonders"',                                 'string'),
('hero', 'hero_description',  '"Where rich heritage meets vibrant culture — explore centuries of tradition, lively festivals, and the warm hospitality of Bocaue."', 'string'),
('hero', 'hero_video_url',    '"/videos/bocaue-hero.mp4"',                      'string'),
('hero', 'hero_fallback_img', '"/images/defaults/no-image.svg"',                'string'),
('hero', 'hero_cta_text',     '"Explore Now"',                                  'string'),
('hero', 'hero_cta_link',     '"/destinations"',                                'string');


-- ========================================================================
-- DONE — Run seed.sql next to import sample content.
-- ========================================================================
SELECT 'MHACTO database schema created and base data seeded successfully!' AS result;
