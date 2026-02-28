-- ========================================================================
-- Featured Landmarks Table Migration
-- Run this script to add featured landmarks table for the home page carousel
-- ========================================================================

-- Featured Landmarks for "Slide through Bocaue's landmarks" carousel
CREATE TABLE IF NOT EXISTS featured_landmarks (
  landmark_id INT AUTO_INCREMENT PRIMARY KEY,
  content_id INT DEFAULT NULL COMMENT 'Reference to CMS cms.content_id (links to CMS place)',
  place_id VARCHAR(100) DEFAULT '' COMMENT 'Legacy: unique identifier (deprecated, use content_id)',
  title VARCHAR(255) NOT NULL COMMENT 'Place/landmark name (cached from CMS)',
  description TEXT COMMENT 'Short description (cached from CMS)',
  image VARCHAR(500) DEFAULT '' COMMENT 'Image URL (cached from CMS)',
  category VARCHAR(100) DEFAULT '' COMMENT 'Category (cached from CMS)',
  sort_order INT DEFAULT 0 COMMENT 'Display order in carousel',
  is_active TINYINT(1) DEFAULT 1 COMMENT '1=visible, 0=hidden',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_order (is_active, sort_order),
  INDEX idx_content_id (content_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- If table already exists, add content_id column:
-- ALTER TABLE featured_landmarks ADD COLUMN content_id INT DEFAULT NULL AFTER landmark_id;
-- ALTER TABLE featured_landmarks ADD INDEX idx_content_id (content_id);
-- ========================================================================

-- ========================================================================
-- Add content_id to spotlight table (for CMS-linked events)
-- ========================================================================
-- Run this if spotlight table already exists:
-- ALTER TABLE spotlight ADD COLUMN content_id INT DEFAULT NULL AFTER spotlight_id;
-- ALTER TABLE spotlight ADD INDEX idx_spotlight_content (content_id);

-- ========================================================================
-- Hero Settings Table (for single hero with video background)
-- ========================================================================

CREATE TABLE IF NOT EXISTS hero_settings (
  setting_id INT AUTO_INCREMENT PRIMARY KEY,
  subtitle VARCHAR(100) DEFAULT '' COMMENT 'Small text above title',
  title VARCHAR(100) NOT NULL COMMENT 'Main title text',
  highlight VARCHAR(100) DEFAULT '' COMMENT 'Highlighted text (optional)',
  description TEXT COMMENT 'Description paragraph',
  video_url VARCHAR(500) DEFAULT '' COMMENT 'Background video URL',
  fallback_image VARCHAR(500) DEFAULT '' COMMENT 'Fallback image for no-video support',
  cta_text VARCHAR(100) DEFAULT 'Explore Now' COMMENT 'Call-to-action button text',
  cta_link VARCHAR(255) DEFAULT '/destinations' COMMENT 'CTA button link',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default hero settings
INSERT INTO hero_settings (subtitle, title, highlight, description, video_url, fallback_image, cta_text, cta_link) VALUES
('Bocaue, Bulacan', 'Explore The River', 'Town Wonders', 'Where rich heritage meets vibrant culture — explore centuries of tradition, lively festivals, and the warm hospitality of Bocaue.', '/videos/bocaue-hero.mp4', '/images/heroes/hero-bocaue.jpg', 'Explore Now', '/destinations');
