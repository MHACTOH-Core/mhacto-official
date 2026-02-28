-- ========================================================================
-- MHACTO Schema Migration v2 — Old (17 tables) → Optimized (10 tables)
-- ========================================================================
-- RUN THIS ONCE on an existing mhacto_db to migrate data.
-- Always back up first:  mysqldump -u root -p mhacto_db > backup.sql
-- ========================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ════════════════════════════════════════════════════════════════
-- STEP 1 — Create new tables
-- ════════════════════════════════════════════════════════════════

-- 1a. users (rename from User)
CREATE TABLE IF NOT EXISTS users LIKE `User`;
INSERT IGNORE INTO users SELECT * FROM `User`;

-- 1b. categories (merge catergory + content_label)
CREATE TABLE IF NOT EXISTS categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id   INT          DEFAULT NULL,
  cat_type    ENUM('category','label') DEFAULT 'category',
  label_key   VARCHAR(50)  DEFAULT NULL,
  label_name  VARCHAR(50)  NOT NULL,
  color_code  VARCHAR(50)  DEFAULT NULL,
  is_active   TINYINT(1)   DEFAULT 1,
  INDEX idx_type      (cat_type),
  INDEX idx_label_key (label_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate categories
INSERT INTO categories (category_id, cat_type, label_name, color_code, is_active)
SELECT category_id, 'category', label_name, color_code, COALESCE(is_active, 1)
FROM catergory;

-- Migrate labels (if content_label table exists)
-- INSERT INTO categories (parent_id, cat_type, label_key, label_name, is_active)
-- SELECT NULL, 'label', label_key, label_name, 1 FROM content_label;

-- 1c. content (merge cms + place + news)
CREATE TABLE IF NOT EXISTS content (
  content_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT          DEFAULT NULL,
  category_id    INT          DEFAULT NULL,
  label_id       INT          DEFAULT NULL,
  title          VARCHAR(255) DEFAULT NULL,
  description    TEXT         DEFAULT NULL,
  status         ENUM('draft','published','archived') DEFAULT 'draft',
  post_type      ENUM('place','news','event') DEFAULT 'place',
  is_featured    TINYINT(1)   DEFAULT 0,
  location       VARCHAR(255) DEFAULT NULL,
  hours          VARCHAR(100) DEFAULT NULL,
  visit_date     DATETIME     DEFAULT NULL,
  contact        VARCHAR(100) DEFAULT NULL,
  established    VARCHAR(50)  DEFAULT NULL,
  place_category VARCHAR(100) DEFAULT NULL,
  story          TEXT         DEFAULT NULL,
  news_date      DATE         DEFAULT NULL,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status    (status),
  INDEX idx_post_type (post_type),
  INDEX idx_featured  (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate CMS data
INSERT INTO content (content_id, user_id, category_id, title, description, status, is_featured, created_at, updated_at)
SELECT content_id, user_id, category_id, title, description, status, COALESCE(is_featured, 0), created_at, updated_at
FROM cms;

-- Merge place columns in
UPDATE content c
INNER JOIN place p ON p.content_id = c.content_id
SET c.post_type      = 'place',
    c.location       = p.location,
    c.hours          = p.hours,
    c.visit_date     = p.date,
    c.contact        = p.contact,
    c.established    = p.established,
    c.place_category = p.category,
    c.story          = p.story;

-- Merge news columns in
UPDATE content c
INNER JOIN news n ON n.content_id = c.content_id
SET c.post_type = CASE WHEN c.post_type = 'place' THEN 'news' ELSE c.post_type END,
    c.news_date = n.date;

-- Set post_type for rows that have news data but no place data
UPDATE content c
SET c.post_type = 'news'
WHERE c.content_id IN (SELECT content_id FROM news)
  AND c.content_id NOT IN (SELECT content_id FROM place);

-- 1d. content_images (rename from content_image)
CREATE TABLE IF NOT EXISTS content_images LIKE content_image;
ALTER TABLE content_images ADD COLUMN sort_order INT DEFAULT 0 AFTER is_thumbnail;
INSERT IGNORE INTO content_images (image_id, content_id, image_url, is_thumbnail, created_at)
SELECT image_id, content_id, image_url, is_thumbnail, created_at FROM content_image;

-- 1e. featured_content (merge spotlight + featured_landmarks)
CREATE TABLE IF NOT EXISTS featured_content (
  featured_id INT AUTO_INCREMENT PRIMARY KEY,
  content_id  INT          DEFAULT NULL,
  section     ENUM('spotlight','landmark') NOT NULL,
  sort_order  INT          DEFAULT 0,
  is_active   TINYINT(1)   DEFAULT 1,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_section_active (section, is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate spotlight entries that have a content_id
INSERT INTO featured_content (content_id, section, sort_order, is_active, created_at, updated_at)
SELECT content_id, 'spotlight', 0, COALESCE(is_active, 0), created_at, updated_at
FROM spotlight
WHERE content_id IS NOT NULL;

-- Migrate featured_landmarks entries that have a content_id
-- INSERT INTO featured_content (content_id, section, sort_order, is_active, created_at, updated_at)
-- SELECT content_id, 'landmark', sort_order, COALESCE(is_active, 1), created_at, updated_at
-- FROM featured_landmarks
-- WHERE content_id IS NOT NULL;

-- 1f. inquiries (merge customer_inquiries + inquiry_sender + student_verify)
CREATE TABLE IF NOT EXISTS inquiries (
  inquiry_id     INT AUTO_INCREMENT PRIMARY KEY,
  full_name      VARCHAR(255) DEFAULT NULL,
  email_address  VARCHAR(255) DEFAULT NULL,
  contact_number VARCHAR(255) DEFAULT NULL,
  inquiry_type   INT          DEFAULT 1,
  purpose_id     INT          DEFAULT NULL,
  date_of_visit  DATE         DEFAULT NULL,
  number_of_pax  INT          DEFAULT NULL,
  message        TEXT         DEFAULT NULL,
  is_read        TINYINT(1)   DEFAULT 0,
  is_assigned    TINYINT(1)   DEFAULT 0,
  folder         ENUM('inbox','archive','spam','trash') DEFAULT 'inbox',
  student_number VARCHAR(255) DEFAULT NULL,
  school_name    VARCHAR(255) DEFAULT NULL,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  deleted_at     TIMESTAMP    NULL DEFAULT NULL,
  INDEX idx_folder (folder),
  INDEX idx_read   (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate inquiry data (joining sender + student info)
INSERT INTO inquiries (inquiry_id, full_name, email_address, contact_number,
                       inquiry_type, purpose_id, date_of_visit, number_of_pax,
                       message, is_read, is_assigned, folder,
                       student_number, school_name, created_at, deleted_at)
SELECT ci.inquiry_id,
       s.full_name, s.email_address, s.contact_number,
       ci.Type, ci.purpose_id, ci.date_of_visit, ci.number_of_pax,
       ci.message, COALESCE(ci.is_read, 0), 0,  -- is_assigned defaults to 0 (was is_starred)
       COALESCE(ci.folder, 'inbox'),
       sv.student_number, sv.school_name,
       ci.created_at, ci.deleted_at
FROM customer_inquiries ci
LEFT JOIN inquiry_sender s   ON ci.sender_id  = s.sender_id
LEFT JOIN student_verify sv  ON ci.inquiry_id = sv.inquiry_id;

-- 1g. Absorb hero_settings into site_settings
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_subtitle     VARCHAR(100) DEFAULT ''              AFTER enable_analytics,
  ADD COLUMN IF NOT EXISTS hero_title        VARCHAR(100) DEFAULT 'Explore The River' AFTER hero_subtitle,
  ADD COLUMN IF NOT EXISTS hero_highlight    VARCHAR(100) DEFAULT ''              AFTER hero_title,
  ADD COLUMN IF NOT EXISTS hero_description  TEXT         DEFAULT NULL            AFTER hero_highlight,
  ADD COLUMN IF NOT EXISTS hero_video_url    VARCHAR(500) DEFAULT ''              AFTER hero_description,
  ADD COLUMN IF NOT EXISTS hero_fallback_img VARCHAR(500) DEFAULT ''              AFTER hero_video_url,
  ADD COLUMN IF NOT EXISTS hero_cta_text     VARCHAR(100) DEFAULT 'Explore Now'  AFTER hero_fallback_img,
  ADD COLUMN IF NOT EXISTS hero_cta_link     VARCHAR(255) DEFAULT '/destinations' AFTER hero_cta_text;

-- Copy hero_settings data into site_settings (if exists)
UPDATE site_settings ss
INNER JOIN (SELECT * FROM hero_settings ORDER BY setting_id LIMIT 1) hs ON 1=1
SET ss.hero_subtitle     = hs.subtitle,
    ss.hero_title        = hs.title,
    ss.hero_highlight    = hs.highlight,
    ss.hero_description  = hs.description,
    ss.hero_video_url    = hs.video_url,
    ss.hero_fallback_img = hs.fallback_image,
    ss.hero_cta_text     = hs.cta_text,
    ss.hero_cta_link     = hs.cta_link;

-- 1h. Absorb click_analytics into activity_logs
ALTER TABLE activity_logs
  MODIFY COLUMN action ENUM('create','update','delete','login','logout','page_view') DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS content_id INT DEFAULT NULL AFTER user_id,
  ADD COLUMN IF NOT EXISTS page_path  VARCHAR(255) DEFAULT NULL AFTER details;

-- Migrate click data
INSERT INTO activity_logs (user_id, content_id, action, page_path, ip_address, created_at)
SELECT NULL, content_id, 'page_view', page_path, visitor_ip, clicked_at
FROM click_analytics;


-- ════════════════════════════════════════════════════════════════
-- STEP 2 — Add foreign keys to new tables
-- ════════════════════════════════════════════════════════════════

-- content FKs
ALTER TABLE content
  ADD FOREIGN KEY (user_id)     REFERENCES users(user_id)          ON DELETE SET NULL,
  ADD FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  ADD FOREIGN KEY (label_id)    REFERENCES categories(category_id) ON DELETE SET NULL;

-- content_images FK
ALTER TABLE content_images
  ADD FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE;

-- featured_content FK
ALTER TABLE featured_content
  ADD FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE;

-- inquiries FK
ALTER TABLE inquiries
  ADD FOREIGN KEY (purpose_id) REFERENCES visit_purposes(purpose_id) ON DELETE SET NULL;

-- activity_logs FK
ALTER TABLE activity_logs
  ADD FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;


-- ════════════════════════════════════════════════════════════════
-- STEP 3 — Drop old tables (DESTRUCTIVE — do after verifying data)
-- ════════════════════════════════════════════════════════════════

-- Uncomment the lines below only after verifying all data migrated correctly!

-- DROP TABLE IF EXISTS student_verify;
-- DROP TABLE IF EXISTS inquiry_sender;
-- DROP TABLE IF EXISTS customer_inquiries;
-- DROP TABLE IF EXISTS click_analytics;
-- DROP TABLE IF EXISTS hero_slides;
-- DROP TABLE IF EXISTS hero_settings;
-- DROP TABLE IF EXISTS culinary_items;
-- DROP TABLE IF EXISTS featured_landmarks;
-- DROP TABLE IF EXISTS spotlight;
-- DROP TABLE IF EXISTS news;
-- DROP TABLE IF EXISTS place;
-- DROP TABLE IF EXISTS content_image;
-- DROP TABLE IF EXISTS cms;
-- DROP TABLE IF EXISTS catergory;
-- DROP TABLE IF EXISTS `User`;

SET FOREIGN_KEY_CHECKS = 1;

-- ════════════════════════════════════════════════════════════════
-- DONE. Verify with: SHOW TABLES;
-- Expected: 10 tables — users, categories, content, content_images,
--   featured_content, inquiries, visit_purposes, milestones,
--   site_settings, activity_logs
-- ════════════════════════════════════════════════════════════════
