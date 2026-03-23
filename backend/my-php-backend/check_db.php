<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config/database.php';

try {
    $db = (new App\Config\Database())->getConnection();
    echo "DB connected OK\n";

    // Add missing columns
    $db->exec("ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS role ENUM('super_admin','admin','content_manager') DEFAULT 'admin' AFTER password_hash,
        ADD COLUMN IF NOT EXISTS status ENUM('active','inactive') DEFAULT 'active' AFTER role,
        ADD COLUMN IF NOT EXISTS full_name VARCHAR(200) DEFAULT NULL AFTER username,
        ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) DEFAULT NULL AFTER email");
    echo "Columns added (or already exist)\n";

    // Show table columns
    echo "\nusers table columns:\n";
    $cols = $db->query("DESCRIBE users")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $c) {
        echo "  {$c['Field']} ({$c['Type']})\n";
    }

    // Show users
    echo "\nExisting users:\n";
    $stmt = $db->query("SELECT user_id, username, email, role, status FROM users");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo count($rows) . " user(s) found\n";
    foreach ($rows as $r) {
        echo "  {$r['email']} | {$r['role']} | {$r['status']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
