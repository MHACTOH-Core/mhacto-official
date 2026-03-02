<?php
// models/User.php

class User {
    private $conn;
    private $table_name = "users";

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    /**
     * Authenticate a user by email + password.
     * Returns the user row (without password_hash) on success, false on failure.
     */
    public function loginByEmail(string $email, string $password): array|false {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);

        $query = "SELECT user_id, username, email, password_hash, role
                  FROM {$this->table_name}
                  WHERE email = :email
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                if (password_verify($password, $row['password_hash'])) {
                    unset($row['password_hash']);
                    return $row;
                }
            }
            return false;
        } catch (PDOException $e) {
            error_log("User::loginByEmail error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Legacy login by username (kept for backward compatibility).
     */
    public function login(string $username, string $password): array|false {
        $username = htmlspecialchars(strip_tags($username));

        $query = "SELECT user_id, username, email, password_hash, role
                  FROM {$this->table_name}
                  WHERE username = :username
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                if (password_verify($password, $row['password_hash'])) {
                    unset($row['password_hash']);
                    return $row;
                }
            }
            return false;
        } catch (PDOException $e) {
            error_log("User::login error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Find a user by ID (useful for session validation).
     */
    public function findById(int $id): array|false {
        $query = "SELECT user_id, username, email, role
                  FROM {$this->table_name}
                  WHERE user_id = :id
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
        } catch (PDOException $e) {
            return false;
        }
    }
}