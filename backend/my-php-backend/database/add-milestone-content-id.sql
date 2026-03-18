-- Migration: Connect milestone table to CMS content (timeline-of-events)
-- Run this against the database to add content_id FK to milestone table.

-- 1. Add content_id column (nullable, references content)
ALTER TABLE milestone
  ADD COLUMN content_id INT DEFAULT NULL AFTER milestone_id;

-- 2. Add foreign key (SET NULL on delete so milestone row survives if CMS post is removed)
ALTER TABLE milestone
  ADD CONSTRAINT fk_milestone_content
  FOREIGN KEY (content_id) REFERENCES content(content_id)
  ON DELETE SET NULL;

-- 3. Make year and title nullable (pulled from CMS when content_id is set, kept as fallback)
ALTER TABLE milestone
  MODIFY year INT DEFAULT NULL,
  MODIFY title VARCHAR(255) DEFAULT NULL;
