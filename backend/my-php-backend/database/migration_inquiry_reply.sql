-- ========================================================================
-- Migration: Add reply + subject columns to inquiries table
-- Run against mhacto_db
-- ========================================================================

-- Add subject column for inquiry subjects
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS subject VARCHAR(255) DEFAULT NULL COMMENT 'Inquiry subject line' AFTER contact_number;

-- Add reply columns for admin replies
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS reply_message TEXT DEFAULT NULL COMMENT 'Admin reply text' AFTER school_name,
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When admin replied' AFTER reply_message;
