<?php
// database.php - PDO connection script for MariaDB

class Database {
    private $host = 'localhost';
    private $db   = 'mhacto_db'; // Change to your database name
    private $user = 'mhacto_admin';      // Change to your database user
    private $pass = 'mhactoAdmin';  // Change to your database password
    private $charset = 'utf8mb4';
    private $conn = null;

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
?>
