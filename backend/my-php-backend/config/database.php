<?php
// database.php - PDO connection script for MariaDB

$host = 'localhost';
$db   = 'mhacto_db'; // Change to your database name
$user = 'mhacto_admin';      // Change to your database user
$pass = 'mhactoAdmin';  // Change to your database password
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
	PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
	PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
	PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
	$pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
	http_response_code(500);
	echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
	exit;
}
