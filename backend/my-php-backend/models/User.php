<?php
/**
 * User Model — Schema v2 with roles.
 * Columns: user_id, username, full_name, email, password_hash, role, status, created_at
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

        $query = "SELECT user_id, username, full_name, profile_picture, email, password_hash, role
                  FROM {$this->table_name}
                  WHERE email = :email AND status = 'active'
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
     * Look up a user by email — returns the full row (including password_hash
     * and status) so callers can perform granular auth checks.
     */
    public function findByEmail(string $email): array|false
    {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);

        $query = "SELECT user_id, username, full_name, profile_picture, email, password_hash, role, status
                  FROM {$this->table_name}
                  WHERE email = :email
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            return $stmt->rowCount() > 0 ? $stmt->fetch(PDO::FETCH_ASSOC) : false;
        } catch (PDOException $e) {
            error_log("User::findByEmail error: " . $e->getMessage());
            return false;
        }
    }

    public function findById(int $id): array|false
    {
        $query = "SELECT user_id, username, full_name, profile_picture, email, role, status, created_at
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

    /** List all users (active by default, or all) */
    public function listAll(bool $includeArchived = false): array
    {
        $where = $includeArchived ? "" : "WHERE status = 'active'";
        $query = "SELECT user_id, username, full_name, profile_picture, email, role, status, created_at
                  FROM {$this->table_name}
                  {$where}
                  ORDER BY created_at ASC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("User::listAll error: " . $e->getMessage());
            return [];
        }
    }

    /** Create a new user account */
    public function create(string $fullName, string $email, string $password, string $role = 'admin'): array|false
    {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);
        $allowedRoles = ['super_admin', 'admin', 'content_manager'];
        if (!in_array($role, $allowedRoles, true)) {
            $role = 'admin';
        }

        // Check for duplicate email
        $checkQuery = "SELECT user_id FROM {$this->table_name} WHERE email = :email LIMIT 1";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(':email', $email);
        $checkStmt->execute();
        if ($checkStmt->rowCount() > 0) {
            return false;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $username = strtolower(explode('@', $email)[0]);

        $query = "INSERT INTO {$this->table_name} (username, full_name, email, password_hash, role, status)
                  VALUES (:username, :full_name, :email, :password_hash, :role, 'active')";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':full_name', $fullName);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password_hash', $passwordHash);
            $stmt->bindParam(':role', $role);
            $stmt->execute();

            $userId = (int) $this->conn->lastInsertId();
            return $this->findById($userId);
        } catch (PDOException $e) {
            error_log("User::create error: " . $e->getMessage());
            return false;
        }
    }

    /** Update user details (full_name, email, role, password) */
    public function update(int $id, array $data): array|false
    {
        $sets = [];
        $params = [':id' => $id];

        if (isset($data['full_name'])) {
            $sets[] = "full_name = :full_name";
            $params[':full_name'] = $data['full_name'];
        }
        if (array_key_exists('profile_picture', $data)) {
            $sets[] = "profile_picture = :profile_picture";
            $params[':profile_picture'] = $data['profile_picture'];
        }
        if (isset($data['email'])) {
            $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
            // Check duplicate email (excluding this user)
            $checkQuery = "SELECT user_id FROM {$this->table_name} WHERE email = :check_email AND user_id != :check_id LIMIT 1";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':check_email', $email);
            $checkStmt->bindParam(':check_id', $id, PDO::PARAM_INT);
            $checkStmt->execute();
            if ($checkStmt->rowCount() > 0) {
                return false;
            }
            $sets[] = "email = :email";
            $params[':email'] = $email;
            $sets[] = "username = :username";
            $params[':username'] = strtolower(explode('@', $email)[0]);
        }
        if (isset($data['role'])) {
            $allowedRoles = ['super_admin', 'admin', 'content_manager'];
            if (in_array($data['role'], $allowedRoles, true)) {
                $sets[] = "role = :role";
                $params[':role'] = $data['role'];
            }
        }
        if (!empty($data['password'])) {
            $sets[] = "password_hash = :password_hash";
            $params[':password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        if (empty($sets)) return $this->findById($id);

        $query = "UPDATE {$this->table_name} SET " . implode(', ', $sets) . " WHERE user_id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $val) {
                $stmt->bindValue($key, $val);
            }
            $stmt->execute();
            return $this->findById($id);
        } catch (PDOException $e) {
            error_log("User::update error: " . $e->getMessage());
            return false;
        }
    }

    /** Soft-delete (archive) a user — sets status to 'archived' */
    public function archive(int $id): bool
    {
        // Protect main super_admin (user_id = 1)
        if ($id === 1) return false;

        $query = "UPDATE {$this->table_name} SET status = 'archived' WHERE user_id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("User::archive error: " . $e->getMessage());
            return false;
        }
    }

    /** Change password with old password verification */
    public function changePassword(int $id, string $oldPassword, string $newPassword): bool|string
    {
        $query = "SELECT password_hash FROM {$this->table_name} WHERE user_id = :id LIMIT 1";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) return 'User not found.';
            if (!password_verify($oldPassword, $row['password_hash'])) {
                return 'Current password is incorrect.';
            }
            $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
            $updateStmt = $this->conn->prepare("UPDATE {$this->table_name} SET password_hash = :hash WHERE user_id = :id");
            $updateStmt->bindParam(':hash', $newHash);
            $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $updateStmt->execute();
        } catch (PDOException $e) {
            error_log("User::changePassword error: " . $e->getMessage());
            return 'An error occurred.';
        }
    }

    /** Restore an archived user back to active */
    public function restore(int $id): bool
    {
        $query = "UPDATE {$this->table_name} SET status = 'active' WHERE user_id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("User::restore error: " . $e->getMessage());
            return false;
        }
    }
}
