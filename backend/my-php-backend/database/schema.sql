-- ========================================================================
-- MHACTO Database Schema v2 (mhacto_db)
-- Bocaue, Bulacan — Tourism Website
-- Restructured: 11 tables (visit_purposes removed, inquiries v3 with JSON form_data)
-- ========================================================================
--
-- TABLES (11)
-- ───────────────────────────────────────────────────────────────────
--  1. users
--  2. config              (replaces site_settings — flexible key-value)
--  3. category            (was categories — cat_type → category_type)
--  4. content             (simplified — place/news columns → content_fields)
--  5. content_fields      (dynamic key-value metadata per content)
--  6. content_images      (unchanged)
--  7. featured_content    (unchanged)
--  8. inquiries           (v4 — hybrid: real sortable cols + JSON additional_details)
--  9. activity_logs       (details → JSON)
-- 10. milestone           (was milestones — minor column changes)
-- 11. page_views          (per-destination click analytics for admin dashboard)
-- ========================================================================


-- ────────────────────────────────────────────────────────────────
-- 1. USERS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) DEFAULT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(100) DEFAULT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 2. CONFIG  (replaces site_settings — flexible key-value store)
--    config_group groups related keys (e.g. 'hero', 'general')
--    config_value is JSON for dynamic typing
-- ────────────────────────────────────────────────────────────────
CREATE TABLE config (
  config_id    INT AUTO_INCREMENT PRIMARY KEY,
  config_group VARCHAR(50)  NOT NULL       COMMENT 'e.g., hero, general',
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
-- 3. CATEGORY  (was categories)
--    category_type = ENUM for broad type classification
--    parent_id     = optional hierarchy (label → parent category)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE category (
  category_id   INT AUTO_INCREMENT PRIMARY KEY,
  parent_id     INT          DEFAULT NULL   COMMENT 'FK to parent category (for labels)',
  category_type ENUM('category','label') DEFAULT 'category',
  label_key     VARCHAR(50)  DEFAULT NULL   COMMENT 'URL-safe key (labels only)',
  label_name    VARCHAR(50)  NOT NULL       COMMENT 'Display name',
  color_code    VARCHAR(50)  DEFAULT NULL   COMMENT 'Badge colour (categories only)',
  is_active     TINYINT(1)   DEFAULT 1,
  FOREIGN KEY (parent_id) REFERENCES category(category_id) ON DELETE SET NULL,
  INDEX idx_type      (category_type),
  INDEX idx_label_key (label_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 4. CONTENT  (simplified — place/news columns moved to content_fields)
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
  FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE SET NULL,
  INDEX idx_status    (status),
  INDEX idx_post_type (post_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 5. CONTENT_FIELDS  (dynamic key-value metadata per content)
--    Replaces inlined place/news columns in content.
--    e.g., meta_key = 'location', meta_value = 'Bocaue, Bulacan'
--          meta_key = 'news_date', meta_value = '2026-03-01'
--          meta_key = 'label_id', meta_value = '5'
--          meta_key = 'is_featured', meta_value = '1'
-- ────────────────────────────────────────────────────────────────
CREATE TABLE content_fields (
  meta_id    INT AUTO_INCREMENT PRIMARY KEY,
  content_id INT          NOT NULL,
  meta_key   VARCHAR(100) NOT NULL       COMMENT 'e.g., location, hours, news_date',
  meta_value TEXT         DEFAULT NULL   COMMENT 'Value or JSON for complex data',
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE,
  INDEX idx_content_key (content_id, meta_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 6. CONTENT_IMAGES
-- ────────────────────────────────────────────────────────────────
CREATE TABLE content_images (
  image_id     INT AUTO_INCREMENT PRIMARY KEY,
  content_id   INT          DEFAULT NULL,
  image_url    VARCHAR(255) DEFAULT NULL,
  is_thumbnail TINYINT(1)   DEFAULT 0,
  sort_order   INT          DEFAULT 0,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE,
  INDEX idx_content (content_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 7. FEATURED_CONTENT
-- ────────────────────────────────────────────────────────────────
CREATE TABLE featured_content (
  featured_id INT AUTO_INCREMENT PRIMARY KEY,
  content_id  INT          DEFAULT NULL  COMMENT 'FK → content.content_id',
  section     ENUM('spotlight','landmark') NOT NULL,
  sort_order  INT          DEFAULT 0,
  is_active   TINYINT(1)   DEFAULT 1,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE,
  INDEX idx_section_active (section, is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 8. INQUIRIES  (v4 — hybrid: real sortable cols + JSON extras)
--    date_of_visit & number_of_pax promoted back to real columns
--    for easy sorting / aggregation by tourism admin.
--    additional_details JSON handles contextual data.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE inquiries (
  inquiry_id         INT AUTO_INCREMENT PRIMARY KEY,
  inquiry_type       VARCHAR(50)  DEFAULT 'general_contact' COMMENT 'general_contact, tour_booking, partnership, etc.',
  full_name          VARCHAR(255) NOT NULL,
  email_address      VARCHAR(255) NOT NULL,
  contact_number     VARCHAR(20)  DEFAULT NULL  COMMENT 'Supports country codes e.g. +63…',
  date_of_visit      DATE         DEFAULT NULL  COMMENT 'Real column — sortable by upcoming visits',
  number_of_pax      INT          DEFAULT NULL  COMMENT 'Real column — aggregatable crowd volume',
  message            TEXT         DEFAULT NULL,
  additional_details JSON         DEFAULT NULL  COMMENT 'Contextual extras: school_name, company_name, referral_source, dietary_needs, etc.',
  status             ENUM('unread','in_progress','assigned','archived','spam','trash') DEFAULT 'unread' COMMENT 'assigned = handed off to a tourist guide',
  assigned_to        VARCHAR(150) DEFAULT NULL  COMMENT 'Tourist guide name/ID assigned to handle this inquiry',
  reply_text         TEXT         DEFAULT NULL  COMMENT 'Admin reply stored for in-app thread display',
  replied_at         TIMESTAMP    DEFAULT NULL  COMMENT 'When the admin sent the reply',
  replied_by         VARCHAR(100) DEFAULT NULL  COMMENT 'Admin username who replied',
  created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status    (status),
  INDEX idx_type      (inquiry_type),
  INDEX idx_visit     (date_of_visit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 9. ACTIVITY_LOGS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE activity_logs (
  log_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          DEFAULT NULL  COMMENT 'NULL for public page_view events',
  content_id INT          DEFAULT NULL  COMMENT 'Related CMS content (optional)',
  action     ENUM('create','update','delete','login','logout','page_view') DEFAULT NULL,
  details    JSON         DEFAULT NULL  COMMENT 'Dynamic payload for action context',
  page_path  VARCHAR(255) DEFAULT NULL  COMMENT 'URL path (page_view events)',
  ip_address VARCHAR(45)  DEFAULT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_action  (action),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 10. MILESTONE
-- ────────────────────────────────────────────────────────────────
CREATE TABLE milestone (
  milestone_id INT AUTO_INCREMENT PRIMARY KEY,
  year         INT          NOT NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT         DEFAULT NULL,
  detail       TEXT         DEFAULT NULL,
  side         ENUM('left','right') DEFAULT 'left' COMMENT 'Timeline side: alternates left/right',
  sort_order   VARCHAR(50)  DEFAULT '0',
  is_active    TINYINT(1)   DEFAULT 1,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updates_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_order (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 11. PAGE_VIEWS  (click analytics — one row per destination click)
--     References content(content_id) because "destinations" are
--     stored as content rows with post_type = 'place'.
--     visitor_session_id is a lightweight fingerprint sent by the
--     React frontend so we can de-duplicate per session if needed.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE page_views (
  view_id            INT AUTO_INCREMENT PRIMARY KEY,
  content_id         INT          NOT NULL          COMMENT 'FK → content (post_type = place)',
  visitor_session_id VARCHAR(100) DEFAULT NULL       COMMENT 'Optional client-generated session token',
  clicked_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE,
  INDEX idx_content  (content_id),
  INDEX idx_clicked  (clicked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ========================================================================
-- SEED DATA
-- ========================================================================

-- Default admin user (password: admin123)
INSERT INTO users (username, email, password_hash) VALUES
('admin', 'mhacto.municipalityofbocaue@gmail.com', '$2y$12$bAccO9YaDEfSb0HO/TT5aeEZY3ehXExHqrYUPcxugQffxk5U7BmLG');

-- Categories (broad groups)
INSERT INTO category (category_type, label_key, label_name, color_code, is_active) VALUES
('category', NULL, 'History',               '#3b82f6', 1),
('category', NULL, 'Arts & Culture',        '#10b981', 1),
('category', NULL, 'Tourist Destinations',  '#f59e0b', 1),
('category', NULL, 'News & Events',         '#ef4444', 1);

-- Labels (sub-labels, linked to parent category)
INSERT INTO category (parent_id, category_type, label_key, label_name, is_active) VALUES
(1, 'label', 'timeline-of-events',  'Timeline of Events',  1),
(1, 'label', 'notable-figures',     'Notable Figures',     1),
(2, 'label', 'local-cuisine',       'Local Cuisine',       1),
(2, 'label', 'festivals',           'Festivals',           1),
(2, 'label', 'cultural-practices',  'Cultural Practices',  1),
(3, 'label', 'destinations',        'Destinations',        1),
(3, 'label', 'travel-tours',        'Travel Tours',        1),
(4, 'label', 'events',              'Events',              1),
(4, 'label', 'news',                'News',                1);

-- Community category + labels
INSERT INTO category (category_type, label_key, label_name, color_code, is_active) VALUES
('category', NULL, 'Community', '#6366f1', 1);

SET @community_id = LAST_INSERT_ID();

INSERT INTO category (parent_id, category_type, label_key, label_name, is_active) VALUES
(@community_id, 'label', 'schools',     'Schools',     1),
(@community_id, 'label', 'colleges',    'Colleges',    1),
(@community_id, 'label', 'hospitals',   'Hospitals',   1),
(@community_id, 'label', 'bocauenos',   'Bocauenos',   1);

-- Additional Arts & Culture labels
INSERT INTO category (parent_id, category_type, label_key, label_name, is_active)
SELECT 2, 'label', 'crafts-artisan', 'Crafts & Artisan', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE label_key = 'crafts-artisan');

INSERT INTO category (parent_id, category_type, label_key, label_name, is_active)
SELECT 2, 'label', 'people-wonders', 'People & Wonders', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE label_key = 'people-wonders');

-- Restaurants & Local Business labels (Arts & Culture → parent_id = 2)
INSERT INTO category (parent_id, category_type, label_key, label_name, is_active)
SELECT 2, 'label', 'restaurants', 'Restaurants & Eateries', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE label_key = 'restaurants');

INSERT INTO category (parent_id, category_type, label_key, label_name, is_active)
SELECT 2, 'label', 'local-business', 'Local Business', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE label_key = 'local-business');

-- Default config (general settings)
INSERT INTO config (config_group, config_key, config_value, data_type) VALUES
('general', 'site_name',          '"MHACTO Bocaue"', 'string'),
('general', 'site_description',   '"Municipal History, Arts, Culture & Tourism Office — Bocaue, Bulacan"', 'string'),
('general', 'contact_email',      '"mhacto@bocaue.gov.ph"', 'string'),
('general', 'contact_phone',      '"(044) 123-4567"', 'string'),
('general', 'office_address',     '"Municipal Hall, Bocaue, Bulacan 3018"', 'string'),
('general', 'site_logo_url',      'null', 'string'),
('general', 'notify_inquiries',   'true', 'boolean'),
('general', 'enable_analytics',   'true', 'boolean');

-- Default config (hero settings)
INSERT INTO config (config_group, config_key, config_value, data_type) VALUES
('hero', 'hero_subtitle',     '"Bocaue, Bulacan"', 'string'),
('hero', 'hero_title',        '"Explore The River"', 'string'),
('hero', 'hero_highlight',    '"Town Wonders"', 'string'),
('hero', 'hero_description',  '"Where rich heritage meets vibrant culture — explore centuries of tradition, lively festivals, and the warm hospitality of Bocaue."', 'string'),
('hero', 'hero_video_url',    '"/videos/bocaue-hero.mp4"', 'string'),
('hero', 'hero_fallback_img', '"/images/heroes/hero-bocaue.jpg"', 'string'),
('hero', 'hero_cta_text',     '"Explore Now"', 'string'),
('hero', 'hero_cta_link',     '"/destinations"', 'string');

-- visit_purposes table removed — purposes are now stored in inquiries.form_data JSON
