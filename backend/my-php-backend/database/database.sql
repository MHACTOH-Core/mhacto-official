-- ========================================================================
-- MHACTO Complete Database Export — Bocaue, Bulacan
-- Generated: 2026-03-04
--
-- This file creates the database, all 11 tables, config, categories,
-- admin user, and test content data. Import on any fresh MySQL/MariaDB
-- instance to get a fully working copy.
--
-- Usage:
--   mysql -u root -p < database.sql
-- ========================================================================

-- ────────────────────────────────────────────────────────────────
-- DATABASE SETUP
-- ────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS mhacto_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mhacto_db;

-- Disable FK checks so we can drop/create in any order
SET FOREIGN_KEY_CHECKS = 0;

-- ────────────────────────────────────────────────────────────────
-- DROP EXISTING TABLES (clean slate)
-- ────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS page_views;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS milestone;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS featured_content;
DROP TABLE IF EXISTS content_images;
DROP TABLE IF EXISTS content_fields;
DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS config;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;


-- ========================================================================
-- TABLE DEFINITIONS (11 tables)
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
-- 2. CONFIG  (flexible key-value store for site settings)
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
-- 3. CATEGORY
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
-- 4. CONTENT
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
-- 8. INQUIRIES
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
-- 11. PAGE_VIEWS  (click analytics per destination)
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
-- SEED DATA — Admin user, categories, config
-- ========================================================================


-- ── Admin user (password: admin123) ────────────────────────────

INSERT INTO users (username, email, password_hash) VALUES
('admin', 'mhacto.municipalityofbocaue@gmail.com', '$2y$12$bAccO9YaDEfSb0HO/TT5aeEZY3ehXExHqrYUPcxugQffxk5U7BmLG');


-- ── Categories (IDs 1–4) ──────────────────────────────────────

INSERT INTO category (category_type, label_key, label_name, color_code, is_active) VALUES
('category', NULL, 'History',               '#3b82f6', 1),
('category', NULL, 'Arts & Culture',        '#10b981', 1),
('category', NULL, 'Tourist Destinations',  '#f59e0b', 1),
('category', NULL, 'News & Events',         '#ef4444', 1);


-- ── Labels (IDs 5–13) ─────────────────────────────────────────

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


-- ── Community category (ID 14) + labels (IDs 15–18) ──────────

INSERT INTO category (category_type, label_key, label_name, color_code, is_active) VALUES
('category', NULL, 'Community', '#6366f1', 1);

SET @community_id = LAST_INSERT_ID();

INSERT INTO category (parent_id, category_type, label_key, label_name, is_active) VALUES
(@community_id, 'label', 'schools',     'Schools',     1),
(@community_id, 'label', 'colleges',    'Colleges',    1),
(@community_id, 'label', 'hospitals',   'Hospitals',   1),
(@community_id, 'label', 'bocauenos',   'Bocauenos',   1);


-- ── Additional Arts & Culture labels (IDs 19–20) ─────────────

INSERT INTO category (parent_id, category_type, label_key, label_name, is_active)
SELECT 2, 'label', 'crafts-artisan', 'Crafts & Artisan', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE label_key = 'crafts-artisan');

INSERT INTO category (parent_id, category_type, label_key, label_name, is_active)
SELECT 2, 'label', 'people-wonders', 'People & Wonders', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM category WHERE label_key = 'people-wonders');


-- ── Config: General settings ──────────────────────────────────

INSERT INTO config (config_group, config_key, config_value, data_type) VALUES
('general', 'site_name',          '"MHACTO Bocaue"', 'string'),
('general', 'site_description',   '"Municipal History, Arts, Culture & Tourism Office — Bocaue, Bulacan"', 'string'),
('general', 'contact_email',      '"mhacto@bocaue.gov.ph"', 'string'),
('general', 'contact_phone',      '"(044) 123-4567"', 'string'),
('general', 'office_address',     '"Municipal Hall, Bocaue, Bulacan 3018"', 'string'),
('general', 'site_logo_url',      'null', 'string'),
('general', 'notify_inquiries',   'true', 'boolean'),
('general', 'enable_analytics',   'true', 'boolean');


-- ── Config: Hero settings ─────────────────────────────────────

INSERT INTO config (config_group, config_key, config_value, data_type) VALUES
('hero', 'hero_subtitle',     '"Bocaue, Bulacan"', 'string'),
('hero', 'hero_title',        '"Explore The River"', 'string'),
('hero', 'hero_highlight',    '"Town Wonders"', 'string'),
('hero', 'hero_description',  '"Where rich heritage meets vibrant culture — explore centuries of tradition, lively festivals, and the warm hospitality of Bocaue."', 'string'),
('hero', 'hero_video_url',    '"/videos/bocaue-hero.mp4"', 'string'),
('hero', 'hero_fallback_img', '"/images/heroes/hero-bocaue.jpg"', 'string'),
('hero', 'hero_cta_text',     '"Explore Now"', 'string'),
('hero', 'hero_cta_link',     '"/destinations"', 'string');


-- ========================================================================
-- TEST CONTENT DATA — Places, News, Events, Culinary, Featured, etc.
-- ========================================================================


-- ────────────────────────────────────────────────────────────────
-- PLACES (post_type = 'place')
-- category_id 3 = Tourist Destinations, label 10 = destinations
-- ────────────────────────────────────────────────────────────────

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 3, 'Bocaue River Cruise', 'Experience the serene beauty of the Bocaue River on a traditional bangka ride. Glide past historic landmarks, lush mangroves, and riverside communities while learning about the town''s deep connection to the waterways that shaped its identity.', 'published', 'place'),
(1, 3, 'San Martin de Tours Parish Church', 'One of the oldest churches in Bulacan, the San Martin de Tours Parish Church has stood as a beacon of faith since the Spanish colonial era. Its Baroque-influenced architecture and centuries-old interior make it a must-visit heritage landmark.', 'published', 'place'),
(1, 3, 'Bocaue Fireworks District', 'Bocaue is the fireworks capital of the Philippines. Visit the Fireworks District to see master pyrotechnicians at work, browse dazzling displays, and learn about the centuries-old craft that has made the town world-famous.', 'published', 'place'),
(1, 3, 'Barangay Lolomboy Heritage Walk', 'Take a leisurely stroll through one of Bocaue''s oldest barangays, where ancestral homes, cobblestone paths, and a vibrant local community reveal the town''s rich colonial past and enduring resilience.', 'published', 'place'),
(1, 3, 'Taal–Bocaue Footbridge', 'A charming pedestrian footbridge connecting Bocaue to neighboring Taal, offering panoramic views of the river delta. Best visited at golden hour when the sunset paints the water in hues of amber and rose.', 'published', 'place'),
(1, 3, 'Bocaue Municipal Plaza', 'The heart of civic life, the Municipal Plaza hosts weekend markets, cultural performances, and community events. Surrounded by heritage buildings and shaded by centuries-old acacia trees, it is the perfect starting point for exploring the town.', 'published', 'place');

SET @place1 = (SELECT content_id FROM content WHERE title = 'Bocaue River Cruise' LIMIT 1);
SET @place2 = (SELECT content_id FROM content WHERE title = 'San Martin de Tours Parish Church' LIMIT 1);
SET @place3 = (SELECT content_id FROM content WHERE title = 'Bocaue Fireworks District' LIMIT 1);
SET @place4 = (SELECT content_id FROM content WHERE title = 'Barangay Lolomboy Heritage Walk' LIMIT 1);
SET @place5 = (SELECT content_id FROM content WHERE title = 'Taal–Bocaue Footbridge' LIMIT 1);
SET @place6 = (SELECT content_id FROM content WHERE title = 'Bocaue Municipal Plaza' LIMIT 1);

-- Place meta fields
INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@place1, 'label_key', 'destinations'), (@place1, 'label_id', '10'), (@place1, 'is_featured', '1'),
(@place1, 'location', 'Bocaue River, Bocaue, Bulacan'), (@place1, 'hours', 'Daily 6:00 AM – 5:00 PM'),
(@place1, 'established', '1920'),

(@place2, 'label_key', 'destinations'), (@place2, 'label_id', '10'), (@place2, 'is_featured', '1'),
(@place2, 'location', 'Poblacion, Bocaue, Bulacan'), (@place2, 'hours', 'Daily 5:00 AM – 8:00 PM'),
(@place2, 'established', '1707'),

(@place3, 'label_key', 'destinations'), (@place3, 'label_id', '10'), (@place3, 'is_featured', '1'),
(@place3, 'location', 'Fireworks District, Bocaue, Bulacan'), (@place3, 'hours', 'Mon–Sat 8:00 AM – 6:00 PM'),
(@place3, 'established', '1860'),

(@place4, 'label_key', 'destinations'), (@place4, 'label_id', '10'), (@place4, 'is_featured', '0'),
(@place4, 'location', 'Lolomboy, Bocaue, Bulacan'), (@place4, 'hours', 'Open 24/7'),

(@place5, 'label_key', 'destinations'), (@place5, 'label_id', '10'), (@place5, 'is_featured', '0'),
(@place5, 'location', 'Bocaue-Taal Border, Bulacan'), (@place5, 'hours', 'Open 24/7'),

(@place6, 'label_key', 'destinations'), (@place6, 'label_id', '10'), (@place6, 'is_featured', '0'),
(@place6, 'location', 'Poblacion, Bocaue, Bulacan'), (@place6, 'hours', 'Open 24/7');

-- Place images (placeholder paths)
INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@place1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@place2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@place3, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@place4, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@place5, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@place6, '/images/heroes/hero-bocaue.jpg', 1, 0);


-- ────────────────────────────────────────────────────────────────
-- NEWS ARTICLES (post_type = 'news')
-- category_id 4 = News & Events, label 13 = news
-- ────────────────────────────────────────────────────────────────

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 4, 'Bocaue Launches New Tourism Website', 'The Municipal History, Arts, Culture & Tourism Office (MHACTO) officially launched its revamped digital platform to promote Bocaue''s heritage and tourism offerings to a wider audience.', 'published', 'news'),
(1, 4, 'River Clean-Up Drive a Success', 'Over 500 volunteers participated in the annual Bocaue River clean-up, collecting 3 tons of waste and planting 200 mangrove seedlings along the riverbanks. The initiative is part of the municipality''s broader environmental conservation program.', 'published', 'news'),
(1, 4, 'Heritage Preservation Ordinance Approved', 'The Sangguniang Bayan of Bocaue approved a landmark ordinance protecting historical structures within the municipality. The law designates 15 buildings and sites as protected heritage properties.', 'published', 'news');

SET @news1 = (SELECT content_id FROM content WHERE title = 'Bocaue Launches New Tourism Website' LIMIT 1);
SET @news2 = (SELECT content_id FROM content WHERE title = 'River Clean-Up Drive a Success' LIMIT 1);
SET @news3 = (SELECT content_id FROM content WHERE title = 'Heritage Preservation Ordinance Approved' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@news1, 'label_key', 'news'), (@news1, 'label_id', '13'), (@news1, 'is_featured', '1'), (@news1, 'news_date', '2026-03-01'),
(@news2, 'label_key', 'news'), (@news2, 'label_id', '13'), (@news2, 'is_featured', '0'), (@news2, 'news_date', '2026-02-20'),
(@news3, 'label_key', 'news'), (@news3, 'label_id', '13'), (@news3, 'is_featured', '0'), (@news3, 'news_date', '2026-02-15');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@news1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@news2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@news3, '/images/heroes/hero-bocaue.jpg', 1, 0);


-- ────────────────────────────────────────────────────────────────
-- EVENTS (post_type = 'event')
-- category_id 4 = News & Events, label 12 = events
-- ────────────────────────────────────────────────────────────────

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 4, 'Pagoda Festival 2026', 'The famous Pagoda Festival returns with a grand river procession honoring the Holy Cross of Wawa. Thousands of devotees gather to witness the floating pagodas, fireworks displays, and cultural performances that make this one of the most spectacular fiestas in Bulacan.', 'published', 'event'),
(1, 4, 'Bocaue Heritage Week', 'A week-long celebration of Bocaue''s history and culture featuring museum tours, traditional cooking demos, folk dance presentations, and a heritage photo exhibition. Open to all residents and visitors.', 'published', 'event'),
(1, 4, 'Pyrotechnics International Competition', 'Bocaue hosts fireworks teams from around the world in a dazzling competition of pyrotechnic artistry. Held annually at the Municipal Grounds, the event draws over 50,000 spectators each year.', 'published', 'event');

SET @event1 = (SELECT content_id FROM content WHERE title = 'Pagoda Festival 2026' LIMIT 1);
SET @event2 = (SELECT content_id FROM content WHERE title = 'Bocaue Heritage Week' LIMIT 1);
SET @event3 = (SELECT content_id FROM content WHERE title = 'Pyrotechnics International Competition' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@event1, 'label_key', 'events'), (@event1, 'label_id', '12'), (@event1, 'is_featured', '1'), (@event1, 'news_date', '2026-07-01'),
(@event1, 'location', 'Bocaue River, Bocaue, Bulacan'),
(@event2, 'label_key', 'events'), (@event2, 'label_id', '12'), (@event2, 'is_featured', '1'), (@event2, 'news_date', '2026-05-15'),
(@event2, 'location', 'Municipal Hall, Bocaue, Bulacan'),
(@event3, 'label_key', 'festivals'), (@event3, 'label_id', '8'), (@event3, 'is_featured', '0'), (@event3, 'news_date', '2026-12-28'),
(@event3, 'location', 'Municipal Grounds, Bocaue, Bulacan');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@event1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@event2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@event3, '/images/heroes/hero-bocaue.jpg', 1, 0);


-- ────────────────────────────────────────────────────────────────
-- LOCAL CUISINE (post_type = 'place', label = local-cuisine)
-- category_id 2 = Arts & Culture, label 7 = local-cuisine
-- ────────────────────────────────────────────────────────────────

INSERT INTO content (user_id, category_id, title, description, status, post_type) VALUES
(1, 2, 'Chicharon ni Mang Tomas', 'The crispiest, most flavorful chicharon in Bulacan. Made from premium pork rind fried to golden perfection, this local favorite has been a staple of Bocaue for over four decades. Best paired with spiced vinegar.', 'published', 'place'),
(1, 2, 'Kakanin sa Palengke', 'A colorful array of traditional Filipino rice cakes — puto, kutsinta, sapin-sapin, and biko — freshly made every morning by local mananahi. Visit the Bocaue Public Market early for the best selection.', 'published', 'place'),
(1, 2, 'Pancit Bocaue', 'A unique local noodle dish featuring thick egg noodles stir-fried with fresh vegetables, shrimp, and pork, seasoned with calamansi and soy sauce. A must-try dish that you won''t find anywhere else.', 'published', 'place');

SET @food1 = (SELECT content_id FROM content WHERE title = 'Chicharon ni Mang Tomas' LIMIT 1);
SET @food2 = (SELECT content_id FROM content WHERE title = 'Kakanin sa Palengke' LIMIT 1);
SET @food3 = (SELECT content_id FROM content WHERE title = 'Pancit Bocaue' LIMIT 1);

INSERT INTO content_fields (content_id, meta_key, meta_value) VALUES
(@food1, 'label_key', 'local-cuisine'), (@food1, 'label_id', '7'), (@food1, 'is_featured', '1'),
(@food1, 'location', 'National Highway, Bocaue, Bulacan'),
(@food2, 'label_key', 'local-cuisine'), (@food2, 'label_id', '7'), (@food2, 'is_featured', '1'),
(@food2, 'location', 'Bocaue Public Market, Bulacan'),
(@food3, 'label_key', 'local-cuisine'), (@food3, 'label_id', '7'), (@food3, 'is_featured', '0'),
(@food3, 'location', 'Various eateries, Bocaue, Bulacan');

INSERT INTO content_images (content_id, image_url, is_thumbnail, sort_order) VALUES
(@food1, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@food2, '/images/heroes/hero-bocaue.jpg', 1, 0),
(@food3, '/images/heroes/hero-bocaue.jpg', 1, 0);


-- ────────────────────────────────────────────────────────────────
-- FEATURED CONTENT (spotlight + landmarks carousel)
-- ────────────────────────────────────────────────────────────────

-- Spotlight: Pagoda Festival
INSERT INTO featured_content (content_id, section, sort_order, is_active) VALUES
(@event1, 'spotlight', 1, 1);

-- Landmarks carousel: top 4 places
INSERT INTO featured_content (content_id, section, sort_order, is_active) VALUES
(@place1, 'landmark', 1, 1),
(@place2, 'landmark', 2, 1),
(@place3, 'landmark', 3, 1),
(@place6, 'landmark', 4, 1);


-- ────────────────────────────────────────────────────────────────
-- MILESTONES (Heritage Timeline)
-- ────────────────────────────────────────────────────────────────

INSERT INTO milestone (year, title, description, detail, side, sort_order, is_active) VALUES
(1580, 'Founding of Bocaue',
 'Bocaue was established as a visita (mission village) under the Augustinian missionaries, marking the beginning of organized settlement along the Bocaue River.',
 'The town''s name is derived from the word "bukaw," referring to the nocturnal owl that once populated the dense forests along the riverbanks. Early settlers were primarily fishermen and farmers who thrived on the river''s abundant resources.',
 'left', 1, 1),

(1707, 'San Martin de Tours Church Built',
 'The construction of the San Martin de Tours Parish Church was completed, establishing Bocaue as a significant religious center in Bulacan province.',
 'Built in the Baroque style, the church survived multiple earthquakes, typhoons, and the destructions of World War II. It features hand-carved wooden altars, century-old santos, and a bell tower that has called the faithful to prayer for over three centuries.',
 'right', 2, 1),

(1860, 'Birth of the Fireworks Industry',
 'Local artisans began crafting fireworks using traditional methods passed down from Chinese merchants, launching an industry that would define Bocaue for generations to come.',
 'What started as small household operations has grown into a multi-million-peso industry with over 200 registered manufacturers. Bocaue fireworks have been featured in international competitions in Canada, Japan, and the Philippines'' own PyroMusical events.',
 'left', 3, 1),

(1896, 'Philippine Revolution in Bocaue',
 'Bocauenos joined the Katipunan and participated in the Philippine Revolution against Spanish colonial rule, with several local heroes leading the charge.',
 'The town served as a strategic staging ground for revolutionary forces due to its riverside location. After independence, many of the town''s revolutionary sites were preserved and can still be visited today.',
 'right', 4, 1),

(1946, 'Post-War Reconstruction',
 'Following the devastation of World War II, the people of Bocaue rebuilt their town from the ruins, restoring the church, municipal hall, and homes with remarkable determination.',
 'The rebuilding period saw the emergence of new industries, including shoe and slipper manufacturing, which became a secondary economic driver alongside fireworks production. The town''s population nearly doubled in the two decades following the war.',
 'left', 5, 1),

(2010, 'Cultural Heritage Recognition',
 'The National Historical Commission of the Philippines recognized several Bocaue landmarks as Important Cultural Properties, including the San Martin de Tours Church and the Pagoda Festival tradition.',
 'This recognition brought increased tourism revenue and national attention to the town''s preservation efforts. It also led to the creation of MHACTO, the Municipal History, Arts, Culture & Tourism Office, to oversee cultural heritage protection.',
 'right', 6, 1),

(2026, 'MHACTO Digital Platform Launch',
 'The Municipal History, Arts, Culture & Tourism Office launched its comprehensive digital platform to showcase Bocaue''s heritage, promote tourism, and serve visitors with modern inquiry and booking systems.',
 'The platform features interactive timelines, virtual destination tours, a CMS-powered news hub, and a tourist inquiry system with real-time assignment to local guides. Built with Next.js, React, and a PHP backend, it represents the town''s commitment to digital innovation.',
 'left', 7, 1);


-- ────────────────────────────────────────────────────────────────
-- INQUIRIES (sample visitor inquiries)
-- ────────────────────────────────────────────────────────────────

INSERT INTO inquiries (inquiry_type, full_name, email_address, contact_number, date_of_visit, number_of_pax, message, additional_details, status) VALUES
('tour_booking', 'Maria Clara Santos', 'maria.santos@gmail.com', '+639171234567', '2026-04-15', 8,
 'Hello! We would like to book a guided tour of Bocaue for our family reunion. We are interested in visiting the historical church, the fireworks district, and the river cruise. Please advise availability.',
 '{"visitorType":"tourist","purposeOfVisit":"Guided Tour / Sightseeing"}', 'unread'),

('tour_booking', 'Prof. Jose Reyes', 'jreyes@university.ph', '+639281234567', '2026-05-10', 35,
 'Our History department would like to arrange an educational field trip for our college students. We are particularly interested in the heritage walk and the church history. Can you provide a student-friendly itinerary?',
 '{"visitorType":"student","schoolName":"Bulacan State University","purposeOfVisit":"Educational / Field Trip"}', 'unread'),

('general_contact', 'Kim Park', 'kimpark@travel.kr', '+821012345678', '2026-06-20', 4,
 'Hi, my friends and I are visiting from South Korea and we heard about the Pagoda Festival. Is it still happening in July? We would love to attend and also try the local food. Any recommendations?',
 '{"visitorType":"tourist","purposeOfVisit":"Attend Festival / Event"}', 'in_progress'),

('partnership', 'Elena Fernandez', 'elena@bulacan-tourism.gov.ph', '+639351234567', NULL, NULL,
 'On behalf of the Provincial Tourism Office, we would like to discuss a potential collaboration for the Bulacan Heritage Trail project. Bocaue would be a key stop on the trail. Please get back to us at your earliest convenience.',
 '{"visitorType":"tourist","purposeOfVisit":"Business / Partnership"}', 'assigned'),

('tour_booking', 'Andrei Villanueva', 'andrei.v@gmail.com', '+639451234567', '2026-03-20', 2,
 'Is the river cruise available on weekdays? Planning a surprise anniversary trip for my wife. Would love a private ride if possible!',
 '{"visitorType":"tourist","purposeOfVisit":"Guided Tour / Sightseeing"}', 'archived');

-- Assign guide to the assigned inquiry
UPDATE inquiries SET assigned_to = 'Guide: Juan dela Cruz' WHERE full_name = 'Elena Fernandez';

-- Add reply to the in-progress inquiry
UPDATE inquiries SET
  reply_text = 'Hi Kim! Yes, the Pagoda Festival is scheduled for the first week of July 2026. It is one of our biggest events! For food, we highly recommend trying the local chicharon and kakanin at the public market. We can arrange a guide for your visit — just let us know your exact dates!',
  replied_at = '2026-03-03 14:30:00',
  replied_by = 'Admin'
WHERE full_name = 'Kim Park';


-- ────────────────────────────────────────────────────────────────
-- ACTIVITY LOGS (sample admin actions)
-- ────────────────────────────────────────────────────────────────

INSERT INTO activity_logs (user_id, content_id, action, details, page_path, ip_address) VALUES
(1, NULL, 'login', '{"username":"admin","method":"email"}', '/admin', '127.0.0.1'),
(1, @place1, 'create', '{"title":"Bocaue River Cruise","post_type":"place"}', '/admin/posts', '127.0.0.1'),
(1, @place2, 'create', '{"title":"San Martin de Tours Parish Church","post_type":"place"}', '/admin/posts', '127.0.0.1'),
(1, @place3, 'create', '{"title":"Bocaue Fireworks District","post_type":"place"}', '/admin/posts', '127.0.0.1'),
(1, @news1, 'create', '{"title":"Bocaue Launches New Tourism Website","post_type":"news"}', '/admin/posts', '127.0.0.1'),
(1, @event1, 'create', '{"title":"Pagoda Festival 2026","post_type":"event"}', '/admin/posts', '127.0.0.1'),
(NULL, @place1, 'page_view', NULL, '/destinations/bocaue-river-cruise', '192.168.1.50'),
(NULL, @place2, 'page_view', NULL, '/destinations/san-martin-de-tours', '192.168.1.51'),
(NULL, @place3, 'page_view', NULL, '/destinations/fireworks-district', '10.0.0.25');


-- ────────────────────────────────────────────────────────────────
-- PAGE VIEWS (destination click analytics)
-- ────────────────────────────────────────────────────────────────

INSERT INTO page_views (content_id, visitor_session_id) VALUES
(@place1, 'sess_abc123'), (@place1, 'sess_def456'), (@place1, 'sess_ghi789'),
(@place1, 'sess_jkl012'), (@place1, 'sess_mno345'),
(@place2, 'sess_abc123'), (@place2, 'sess_pqr678'), (@place2, 'sess_stu901'),
(@place3, 'sess_def456'), (@place3, 'sess_vwx234'), (@place3, 'sess_yza567'),
(@place3, 'sess_bcd890'), (@place3, 'sess_efg123'), (@place3, 'sess_hij456'),
(@place3, 'sess_klm789'),
(@place4, 'sess_nop012'), (@place4, 'sess_qrs345'),
(@place5, 'sess_tuv678'),
(@place6, 'sess_wxy901'), (@place6, 'sess_zab234'), (@place6, 'sess_cde567');


-- ========================================================================
-- DONE!
-- ========================================================================
SELECT 'MHACTO database created and seeded successfully!' AS result;
