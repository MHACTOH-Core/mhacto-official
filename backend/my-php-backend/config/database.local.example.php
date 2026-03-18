<?php
/**
 * Local database credentials override.
 *
 * Copy this file to database.local.php and fill in your own values:
 *
 *   cp database.local.example.php database.local.php      (Linux / macOS)
 *   copy database.local.example.php database.local.php    (Windows CMD)
 *
 * database.local.php is git-ignored so your credentials stay private.
 */

return [
    'host'    => '127.0.0.1',
    'db'      => 'mhacto_db',
    'user'    => 'root',           // your MySQL username
    'pass'    => '',               // your MySQL password
    'charset' => 'utf8mb4',
];
