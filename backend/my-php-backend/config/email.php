<?php
/**
 * config/email.php — SMTP email configuration
 *
 * All credentials are loaded from environment variables (.env file).
 * See .env.example for the required keys.
 */

return [
    // SMTP server credentials
    'host'       => $_ENV['SMTP_HOST']       ?? 'mail.yourdomain.com',
    'port'       => (int)($_ENV['SMTP_PORT'] ?? 465),
    'encryption' => $_ENV['SMTP_ENCRYPTION'] ?? 'ssl',
    'username'   => $_ENV['SMTP_USERNAME']   ?? 'noreply@yourdomain.com',
    'password'   => $_ENV['SMTP_PASSWORD']   ?? '',

    // Sender info shown in outgoing emails
    'from_email' => $_ENV['MAIL_FROM_EMAIL'] ?? 'noreply@yourdomain.com',
    'from_name'  => $_ENV['MAIL_FROM_NAME']  ?? 'MHACTO Bocaue Tourism',

    // Admin email — where new inquiry notifications are sent
    'admin_email' => $_ENV['ADMIN_EMAIL'] ?? 'admin@yourdomain.com',
    'admin_name'  => $_ENV['ADMIN_NAME']  ?? 'MHACTO Admin',
];
