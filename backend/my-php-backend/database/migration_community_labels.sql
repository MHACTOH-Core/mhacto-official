-- =====================================================================
-- Migration: Add Community category + labels for community pages
-- Also add missing Arts & Culture labels (crafts-artisan, people-wonders)
-- Date: 2026-02-27
-- =====================================================================

-- 1. Add "Community" category
INSERT INTO categories (cat_type, label_key, label_name, color_code, is_active)
VALUES ('category', NULL, 'Community', '#6366f1', 1);

-- Grab the newly created category_id
SET @community_id = LAST_INSERT_ID();

-- 2. Add community labels
INSERT INTO categories (parent_id, cat_type, label_key, label_name, is_active) VALUES
(@community_id, 'label', 'schools',     'Schools',     1),
(@community_id, 'label', 'colleges',    'Colleges',    1),
(@community_id, 'label', 'hospitals',   'Hospitals',   1),
(@community_id, 'label', 'bocauenos',   'Bocauenos',   1);

-- 3. Add missing Arts & Culture labels (parent_id = 2 for "Arts & Culture")
-- Only insert if they don't already exist
INSERT INTO categories (parent_id, cat_type, label_key, label_name, is_active)
SELECT 2, 'label', 'crafts-artisan', 'Crafts & Artisan', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE label_key = 'crafts-artisan');

INSERT INTO categories (parent_id, cat_type, label_key, label_name, is_active)
SELECT 2, 'label', 'people-wonders', 'People & Wonders', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE label_key = 'people-wonders');
