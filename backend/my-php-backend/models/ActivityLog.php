<?php
/**
 * ActivityLog Model — Schema v2.
 * `details` column is now JSON type.
 * Joins with `users` table for admin email.
 */

class ActivityLog
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    /** Fetch all admin-action entries (exclude page_view), newest first. */
    public function readAll(int $limit = 100): array
    {
        $query = "
            SELECT al.log_id, al.user_id, al.content_id, al.action,
                   al.details, al.page_path, al.ip_address, al.created_at,
                   u.email, u.username
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.user_id
            WHERE al.action != 'page_view'
            ORDER BY al.created_at DESC
            LIMIT :limit
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return array_map([$this, 'formatRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /** Log a new activity entry. Details is stored as JSON. */
    public function log(string $action, string $details, ?int $userId = null, ?string $ip = null, ?int $contentId = null, ?string $pagePath = null): array|false
    {
        $query = "INSERT INTO activity_logs (user_id, content_id, action, details, page_path, ip_address)
                  VALUES (:user_id, :content_id, :action, :details, :page_path, :ip)";

        try {
            // Encode details as JSON if it isn't already
            $jsonDetails = json_encode($details);

            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':user_id'    => $userId,
                ':content_id' => $contentId,
                ':action'     => $action,
                ':details'    => $jsonDetails,
                ':page_path'  => $pagePath,
                ':ip'         => $ip ?? ($_SERVER['REMOTE_ADDR'] ?? null),
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
        // Decode JSON details back to string for display
        $details = $row['details'] ?? '';
        if (is_string($details)) {
            $decoded = json_decode($details, true);
            if (is_string($decoded)) {
                $details = $decoded;
            } elseif ($decoded !== null) {
                $details = json_encode($decoded);
            }
        }

        return [
            'id'          => (string) $row['log_id'],
            'action'      => $row['action'],
            'description' => $details,
            'timestamp'   => $row['created_at'],
            'user'        => $row['email'] ?? $row['username'] ?? '',
        ];
    }
}
