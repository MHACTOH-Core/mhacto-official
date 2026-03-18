<?php
// database.php - PDO connection script for MariaDB / MySQL
//
// Credentials are loaded from config/database.local.php if it exists,
// otherwise the defaults below are used.  To set up your own credentials:
//
//   cp config/database.local.example.php config/database.local.php
//   Then edit database.local.php with your local MySQL user/password.

class Database {
    private $host;
    private $db;
    private $user;
    private $pass;
    private $charset;
    private $conn = null;

    public function __construct() {
        // Defaults (safe for the shared team MySQL user)
        $defaults = [
            'host'    => '127.0.0.1',
            'db'      => 'mhacto_db',
            'user'    => 'root',
            'pass'    => '',
            'charset' => 'utf8mb4',
        ];

        // Load local overrides if present (git-ignored)
        $localConfig = __DIR__ . '/database.local.php';
        $cfg = file_exists($localConfig) ? (array) require $localConfig : [];

        $merged = array_merge($defaults, $cfg);
        $this->host    = $merged['host'];
        $this->db      = $merged['db'];
        $this->user    = $merged['user'];
        $this->pass    = $merged['pass'];
        $this->charset = $merged['charset'];
    }

    public function getConnection() {
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
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit();
        }

        return $this->conn;
    }
}
