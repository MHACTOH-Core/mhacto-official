<?php
/**
 * User Model — Schema v2.
 * `role` column has been removed from the users table.
 */

class User
{
    private $conn;
    private $table_name = "users";

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function loginByEmail(string $email, string $password): array|false
    {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);

        $query = "SELECT user_id, username, email, password_hash
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

    public function login(string $username, string $password): array|false
    {
        $username = htmlspecialchars(strip_tags($username));

        $query = "SELECT user_id, username, email, password_hash
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

    public function findById(int $id): array|false
    {
        $query = "SELECT user_id, username, email
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
