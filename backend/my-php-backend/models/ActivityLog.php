<?php
/**
 * ActivityLog Model — Reads from existing `activity_logs` table.
 * Joins with `User` table to get the admin email.
 */

class ActivityLog
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    /** Fetch all entries, newest first. */
    public function readAll(int $limit = 100): array
    {
        $query = "
            SELECT al.log_id, al.user_id, al.action, al.details,
                   al.ip_address, al.created_at,
                   u.email, u.username
            FROM activity_logs al
            LEFT JOIN User u ON al.user_id = u.user_id
            ORDER BY al.created_at DESC
            LIMIT :limit
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /** Log a new activity entry. */
    public function log(string $action, string $details, ?int $userId = null, ?string $ip = null): array|false
    {
        $query = "INSERT INTO activity_logs (user_id, action, details, ip_address)
                  VALUES (:user_id, :action, :details, :ip)";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':user_id' => $userId,
                ':action'  => $action,
                ':details' => $details,
                ':ip'      => $ip ?? ($_SERVER['REMOTE_ADDR'] ?? null),
            ]);

            $logId = (int) $this->conn->lastInsertId();
            return [
                'id'          => (string) $logId,
                'action'      => $action,
                'description' => $details,
                'timestamp'   => date('Y-m-d H:i:s'),
                'user'        => '',
            ];
        } catch (PDOException $e) {
            error_log("ActivityLog::log error: " . $e->getMessage());
            return false;
        }
    }

    private function formatRow(array $row): array
    {
        return [
            'id'          => (string) $row['log_id'],
            'action'      => $row['action'],
            'description' => $row['details'] ?? '',
            'timestamp'   => $row['created_at'],
            'user'        => $row['email'] ?? $row['username'] ?? '',
        ];
    }
}
