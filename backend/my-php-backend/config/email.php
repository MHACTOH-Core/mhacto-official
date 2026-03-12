<?php
/**
 * config/email.php — SMTP email configuration
 *
 * ─── Hostinger Setup ─────────────────────────────────────────────
 * 1. Go to Hostinger → hPanel → Email → Email Accounts
 * 2. Create an email account (e.g. noreply@yourdomain.com)
 * 3. Fill in the values below with your Hostinger email credentials
 *
 * SMTP Host:  mail.yourdomain.com   (replace with your actual domain)
 * SMTP Port:  465  with SSL   (recommended)
 *       or:   587  with TLS   (alternative)
 * Username:   your full email address
 * Password:   your email account password
 * ─────────────────────────────────────────────────────────────────
 */

return [
    // SMTP server credentials — replace with your Hostinger email details
    'host'       => 'mail.yourdomain.com',      // e.g. mail.mhacto.gov.ph
    'port'       => 465,                         // 465 for SSL, 587 for TLS
    'encryption' => 'ssl',                       // 'ssl' or 'tls'
    'username'   => 'noreply@yourdomain.com',    // your full email address
    'password'   => 'your_email_password_here',  // your email password

    // Sender info shown in outgoing emails
    'from_email' => 'noreply@yourdomain.com',    // same as username
    'from_name'  => 'MHACTO Bocaue Tourism',

    // Admin email — where new inquiry notifications are sent
    'admin_email' => 'admin@yourdomain.com',
    'admin_name'  => 'MHACTO Admin',
];
