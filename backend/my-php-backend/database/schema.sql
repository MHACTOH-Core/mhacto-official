-- ========================================================================
-- MHACTO Database Schema v3 (mhacto_db)
-- Bocaue, Bulacan — Tourism Website
-- Updated: matches current application code (all models & routes)
-- ========================================================================
--
-- TABLES (12)
-- ───────────────────────────────────────────────────────────────────
--  1. users
--  2. archive_requests    (user archive approval workflow)
--  3. config              (flexible key-value site settings)
--  4. category            (categories + labels for content)
--  5. content             (CMS posts: place/news/event)
--  6. content_fields      (dynamic key-value metadata per content)
--  7. content_images      (images attached to content)
--  8. featured_content    (spotlight + landmark homepage sections)
--  9. inquiries           (visitor inquiries: general, tour, walk-in, partnership)
-- 10. activity_logs       (admin + public action log)
-- 11. milestone           (heritage timeline entries, optionally linked to CMS)
-- 12. page_views          (per-destination click analytics)
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
  notification_prefs JSON DEFAULT NULL               COMMENT 'Per-user notification preferences',
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 2. ARCHIVE_REQUESTS  (user archive approval workflow)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE archive_requests (
  request_id     INT AUTO_INCREMENT PRIMARY KEY,
  target_user_id INT          NOT NULL           COMMENT 'User being archived',
  requested_by   INT          NOT NULL           COMMENT 'Admin who requested the archive',
  status         ENUM('pending','approved','denied') DEFAULT 'pending',
  reason         TEXT         DEFAULT NULL,
  reviewed_by    INT          DEFAULT NULL       COMMENT 'Super-admin who reviewed',
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  reviewed_at    TIMESTAMP    DEFAULT NULL,
  FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by)   REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by)    REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 3. CONFIG  (flexible key-value store for site settings)
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
-- 4. CATEGORY  (broad groups + sub-labels)
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
-- 5. CONTENT  (CMS posts — place, news, event)
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
-- 6. CONTENT_FIELDS  (dynamic key-value metadata per content)
--    UNIQUE index on (content_id, meta_key) so ON DUPLICATE KEY
--    UPDATE in PHP setMeta() works correctly.
-- ────────────────────────────────────────────────────────────────
CREATE TABLE content_fields (
  meta_id    INT AUTO_INCREMENT PRIMARY KEY,
  content_id INT          NOT NULL,
  meta_key   VARCHAR(100) NOT NULL       COMMENT 'e.g., location, hours, news_date, label_key',
  meta_value TEXT         DEFAULT NULL   COMMENT 'Value or JSON for complex data',
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE,
  UNIQUE INDEX idx_content_key (content_id, meta_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 7. CONTENT_IMAGES
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
-- 8. FEATURED_CONTENT  (homepage spotlight + landmarks carousel)
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
-- 9. INQUIRIES  (visitor inquiries — hybrid real cols + JSON extras)
--    inquiry_type is VARCHAR so the app can add new types freely.
--    Current types: general_contact, tour_booking, partnership, walk_in
-- ────────────────────────────────────────────────────────────────
CREATE TABLE inquiries (
  inquiry_id         INT AUTO_INCREMENT PRIMARY KEY,
  inquiry_type       VARCHAR(50)  DEFAULT 'general_contact' COMMENT 'general_contact | tour_booking | partnership | walk_in',
  full_name          VARCHAR(255) NOT NULL,
  email_address      VARCHAR(255) NOT NULL,
  contact_number     VARCHAR(20)  DEFAULT NULL  COMMENT 'Supports country codes e.g. +63…',
  date_of_visit      DATE         DEFAULT NULL  COMMENT 'Sortable by upcoming visits',
  number_of_pax      INT          DEFAULT NULL  COMMENT 'Aggregatable crowd volume',
  message            TEXT         DEFAULT NULL,
  additional_details JSON         DEFAULT NULL  COMMENT 'Contextual extras: school_name, company_name, etc.',
  status             ENUM('unread','read','in_progress','assigned','archived','spam','trash') DEFAULT 'unread',
  assigned_to        VARCHAR(150) DEFAULT NULL  COMMENT 'Tourist guide name/ID',
  reply_text         TEXT         DEFAULT NULL  COMMENT 'Admin reply for in-app thread',
  replied_at         TIMESTAMP    DEFAULT NULL,
  replied_by         VARCHAR(100) DEFAULT NULL  COMMENT 'Admin username who replied',
  created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status    (status),
  INDEX idx_type      (inquiry_type),
  INDEX idx_visit     (date_of_visit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 10. ACTIVITY_LOGS
--     action is VARCHAR(50) to support flexible action strings:
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
-- 11. MILESTONE  (heritage timeline, optionally linked to CMS content)
--     content_id links to a CMS post (timeline-of-events label).
--     year and title are nullable (pulled from CMS when content_id set).
-- ────────────────────────────────────────────────────────────────
CREATE TABLE milestone (
  milestone_id INT AUTO_INCREMENT PRIMARY KEY,
  content_id   INT          DEFAULT NULL   COMMENT 'FK → content (timeline-of-events posts)',
  year         INT          DEFAULT NULL,
  title        VARCHAR(255) DEFAULT NULL,
  description  TEXT         DEFAULT NULL,
  detail       TEXT         DEFAULT NULL,
  side         ENUM('left','right') DEFAULT 'left' COMMENT 'Timeline side: alternates left/right',
  sort_order   VARCHAR(50)  DEFAULT '0',
  is_active    TINYINT(1)   DEFAULT 1,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE SET NULL,
  INDEX idx_active_order (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ────────────────────────────────────────────────────────────────
-- 12. PAGE_VIEWS  (click analytics — one row per destination click)
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
