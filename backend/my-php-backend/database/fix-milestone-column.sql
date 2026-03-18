-- Fix milestone table column typo: updates_at → updated_at
-- Run this once on the live database to match the corrected schema.
ALTER TABLE milestone CHANGE COLUMN updates_at updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
