<?php
/**
 * seed.php — Create default admin user in the existing `User` table.
 *
 * Usage:  php seed.php
 *
 * Safe to run multiple times — checks before inserting.
 */

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "🌱 Seeding database...\n\n";

// ── 1. Create default admin user in `User` table ──────────────────
$adminEmail    = 'admin@mhacto.gov.ph';
$adminUsername = 'admin';
$adminPassword = password_hash('admin123', PASSWORD_BCRYPT);

$stmt = $db->prepare("SELECT user_id FROM User WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $adminEmail]);

if ($stmt->rowCount() === 0) {
    $stmt = $db->prepare(
        "INSERT INTO User (username, email, password_hash, role)
         VALUES (:username, :email, :password_hash, 'admin')"
    );
    $stmt->execute([
        ':username'      => $adminUsername,
        ':email'         => $adminEmail,
        ':password_hash' => $adminPassword,
    ]);
    echo "✅  Admin user created: {$adminEmail} / admin123\n";
} else {
    echo "ℹ️  Admin user already exists.\n";
}

echo "\n🎉 Seeding complete!\n";
