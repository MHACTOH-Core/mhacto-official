<?php
/**
 * seed.php — Create default admin user in the `users` table.
 *
 * Usage:  php seed.php
 *
 * Safe to run multiple times — checks before inserting.
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

$database = new App\Config\Database();
$db = $database->getConnection();

echo "🌱 Seeding database...\n\n";

// ── 1. Create default users (all roles) ────────────────────────
$passwordHash = password_hash('admin123', PASSWORD_BCRYPT);

$users = [
    ['username' => 'superadmin', 'full_name' => 'MHACTO Super Admin', 'email' => 'superadmin@mhacto.gov.ph', 'role' => 'super_admin'],
    ['username' => 'admin',      'full_name' => 'MHACTO Admin',       'email' => 'admin@mhacto.gov.ph',      'role' => 'admin'],
    ['username' => 'content',    'full_name' => 'Content Manager',    'email' => 'content@mhacto.gov.ph',    'role' => 'content_manager'],
];

foreach ($users as $u) {
    $stmt = $db->prepare("SELECT user_id FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $u['email']]);

    if ($stmt->rowCount() === 0) {
        $stmt = $db->prepare(
            "INSERT INTO users (username, full_name, email, password_hash, role, status)
             VALUES (:username, :full_name, :email, :password_hash, :role, 'active')"
        );
        $stmt->execute([
            ':username'      => $u['username'],
            ':full_name'     => $u['full_name'],
            ':email'         => $u['email'],
            ':password_hash' => $passwordHash,
            ':role'          => $u['role'],
        ]);
        echo "✅  {$u['role']} user created: {$u['email']} / admin123\n";
    } else {
        echo "ℹ️  {$u['role']} user already exists ({$u['email']}).\n";
    }
}

echo "\n🎉 Seeding complete!\n";
