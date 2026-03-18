<?php
/**
 * Local email configuration override.
 *
 * Copy this file to email.local.php and fill in your SMTP credentials:
 *
 *   cp email.local.example.php email.local.php      (Linux / macOS)
 *   copy email.local.example.php email.local.php    (Windows CMD)
 *
 * email.local.php is git-ignored so your credentials stay private.
 * If this file does not exist, the defaults in email.php are used.
 */

return [
    'host'       => 'mail.yourdomain.com',
    'port'       => 465,
    'encryption' => 'ssl',
    'username'   => 'noreply@yourdomain.com',
    'password'   => 'your_email_password_here',

    'from_email' => 'noreply@yourdomain.com',
    'from_name'  => 'MHACTO Bocaue Tourism',

    'admin_email' => 'admin@yourdomain.com',
    'admin_name'  => 'MHACTO Admin',
];
