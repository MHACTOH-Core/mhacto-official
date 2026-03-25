-- ========================================================================
-- LEGACY MIGRATION: Fix content_fields index to UNIQUE.
-- schema.sql v3 already creates UNIQUE INDEX.
-- Only run this on databases created BEFORE schema v3.
-- ========================================================================

-- First, deduplicate any existing rows (keep latest per content_id+meta_key).

DELETE cf1 FROM content_fields cf1
INNER JOIN content_fields cf2
  ON cf1.content_id = cf2.content_id
  AND cf1.meta_key = cf2.meta_key
  AND cf1.meta_id < cf2.meta_id;

-- Drop the old non-unique index and create a unique one
ALTER TABLE content_fields
  DROP INDEX idx_content_key,
  ADD UNIQUE INDEX idx_content_key (content_id, meta_key);
