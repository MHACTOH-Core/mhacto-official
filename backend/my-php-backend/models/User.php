<?php
namespace App\Models;

use PDO;
use PDOException;

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

    /**
     * Look up a user by email — returns the full row (including password_hash
     * and status) so callers can perform granular auth checks.
     */
    public function findByEmail(string $email): array|false
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return false;

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
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return false;
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
            $email = $data['email'];
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return false;
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
            if (strlen($data['password']) < 8 || !preg_match('/[A-Za-z]/', $data['password']) || !preg_match('/[0-9]/', $data['password'])) {
                return false;
            }
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

    /** Get notification preferences for a user */
    public function getPreferences(int $id): array
    {
        $query = "SELECT notification_prefs FROM {$this->table_name} WHERE user_id = :id LIMIT 1";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row || !$row['notification_prefs']) {
                return ['enableEmailNotifications' => true, 'enableInquiryAlerts' => true];
            }
            return json_decode($row['notification_prefs'], true) ?: ['enableEmailNotifications' => true, 'enableInquiryAlerts' => true];
        } catch (PDOException $e) {
            error_log("User::getPreferences error: " . $e->getMessage());
            return ['enableEmailNotifications' => true, 'enableInquiryAlerts' => true];
        }
    }

    /** Update notification preferences for a user */
    public function updatePreferences(int $id, array $prefs): bool
    {
        $allowed = ['enableEmailNotifications', 'enableInquiryAlerts'];
        $filtered = array_intersect_key($prefs, array_flip($allowed));
        $json = json_encode($filtered);

        $query = "UPDATE {$this->table_name} SET notification_prefs = :prefs WHERE user_id = :id";
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':prefs', $json);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("User::updatePreferences error: " . $e->getMessage());
            return false;
        }
    }

    /** Restore an archived user back to active */
    public function restore(int $id): bool
    {
        if ($id === 1) return false;
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

    // ─────────────────────────────────────────────────────────────────
    // Archive Requests (approval workflow for archiving super_admins)
    // ─────────────────────────────────────────────────────────────────

    /** Create an archive request (admin requests to archive a super_admin) */
    public function createArchiveRequest(int $targetUserId, int $requestedBy, ?string $reason = null): int|false
    {
        // Don't allow requests against user_id 1
        if ($targetUserId === 1) return false;

        // Check for existing pending request
        $check = $this->conn->prepare(
            "SELECT request_id FROM archive_requests WHERE target_user_id = :tid AND status = 'pending' LIMIT 1"
        );
        $check->execute([':tid' => $targetUserId]);
        if ($check->rowCount() > 0) return false;

        $stmt = $this->conn->prepare(
            "INSERT INTO archive_requests (target_user_id, requested_by, reason) VALUES (:tid, :rid, :reason)"
        );
        $stmt->execute([':tid' => $targetUserId, ':rid' => $requestedBy, ':reason' => $reason]);
        return (int) $this->conn->lastInsertId();
    }

    /** List archive requests (optionally filtered by status) */
    public function listArchiveRequests(?string $status = null): array
    {
        $sql = "SELECT ar.request_id, ar.target_user_id, ar.requested_by, ar.status,
                       ar.reason, ar.reviewed_by, ar.created_at, ar.reviewed_at,
                       tu.full_name AS target_name, tu.email AS target_email, tu.role AS target_role,
                       ru.full_name AS requester_name, ru.email AS requester_email
                FROM archive_requests ar
                JOIN users tu ON ar.target_user_id = tu.user_id
                JOIN users ru ON ar.requested_by = ru.user_id";
        $params = [];
        if ($status) {
            $sql .= " WHERE ar.status = :status";
            $params[':status'] = $status;
        }
        $sql .= " ORDER BY ar.created_at DESC";

        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("User::listArchiveRequests error: " . $e->getMessage());
            return [];
        }
    }

    /** Approve an archive request — archives the target user */
    public function approveArchiveRequest(int $requestId, int $reviewedBy): bool
    {
        try {
            $this->conn->beginTransaction();

            // Get the request
            $stmt = $this->conn->prepare("SELECT target_user_id FROM archive_requests WHERE request_id = :rid AND status = 'pending'");
            $stmt->execute([':rid' => $requestId]);
            $req = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$req) {
                $this->conn->rollBack();
                return false;
            }

            // Protect user_id 1
            if ((int) $req['target_user_id'] === 1) {
                $this->conn->rollBack();
                return false;
            }

            // Archive the target user
            $this->conn->prepare("UPDATE users SET status = 'archived' WHERE user_id = :id")
                ->execute([':id' => $req['target_user_id']]);

            // Update the request
            $this->conn->prepare(
                "UPDATE archive_requests SET status = 'approved', reviewed_by = :rb, reviewed_at = NOW() WHERE request_id = :rid"
            )->execute([':rb' => $reviewedBy, ':rid' => $requestId]);

            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("User::approveArchiveRequest error: " . $e->getMessage());
            return false;
        }
    }

    /** Deny an archive request */
    public function denyArchiveRequest(int $requestId, int $reviewedBy): bool
    {
        try {
            $stmt = $this->conn->prepare(
                "UPDATE archive_requests SET status = 'denied', reviewed_by = :rb, reviewed_at = NOW()
                 WHERE request_id = :rid AND status = 'pending'"
            );
            $stmt->execute([':rb' => $reviewedBy, ':rid' => $requestId]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("User::denyArchiveRequest error: " . $e->getMessage());
            return false;
        }
    }
}
