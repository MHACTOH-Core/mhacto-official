<?php
namespace App\Config;

use PDO;
use PDOException;

// database.php - PDO connection script for MariaDB

class Database {
    private string $host;
    private string $db;
    private string $user;
    private string $pass;
    private string $charset;
    private ?PDO $conn = null;

    public function __construct()
    {
        $this->host    = $_ENV['DB_HOST']    ?? '127.0.0.1';
        $this->db      = $_ENV['DB_NAME']    ?? 'mhacto_db';
        $this->user    = $_ENV['DB_USER']    ?? 'root';
        $this->pass    = $_ENV['DB_PASS']    ?? '';
        $this->charset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';
    }

    public function getConnection(): PDO {
        $this->conn = null;
        $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db . ";charset=" . $this->charset;

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->conn = new PDO($dsn, $this->user, $this->pass, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed.']);
            exit();
        }

        return $this->conn;
    }
}
