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
            // Store details as-is (already a plain string from callers)
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':user_id'    => $userId,
                ':content_id' => $contentId,
                ':action'     => $action,
                ':details'    => $details,
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
        $action  = $row['action'] ?? '';
        $details = $row['details'] ?? '';

        // Decode JSON details
        $data = null;
        if (is_string($details)) {
            $decoded = json_decode($details, true);
            if (is_array($decoded)) {
                $data = $decoded;
            } elseif (is_string($decoded)) {
                $data = null;
                $details = $decoded;
            }
        }

        // Build user-friendly description
        $description = $this->friendlyDescription($action, $data, $details);

        // Build user-friendly display name
        $username = $row['username'] ?? null;
        $email    = $row['email'] ?? null;
        if ($username) {
            $user = ucfirst($username);
        } elseif ($email) {
            $user = ucfirst(explode('@', $email)[0]);
        } else {
            $user = 'System';
        }

        return [
            'id'          => (string) $row['log_id'],
            'action'      => $action,
            'description' => $description,
            'timestamp'   => $row['created_at'],
            'user'        => $user,
        ];
    }

    /**
     * Convert raw action + JSON details into a human-readable sentence.
     */
    private function friendlyDescription(string $action, ?array $data, string $fallback): string
    {
        if ($data === null) {
            return $fallback ?: ucfirst(str_replace('_', ' ', $action));
        }

        $title    = $data['title'] ?? null;
        $postType = $data['post_type'] ?? null;
        $method   = $data['method'] ?? null;

        switch ($action) {
            case 'login':
                $via = $method ? ' via ' . $method : '';
                return "Logged in{$via}";
            case 'logout':
                return 'Logged out';
            case 'create':
                if ($title && $postType) return "Created {$postType}: \"{$title}\"";
                return $title ? "Created \"{$title}\"" : 'Created a new entry';
            case 'update':
                if ($title && $postType) return "Updated {$postType}: \"{$title}\"";
                return $title ? "Updated \"{$title}\"" : 'Updated an entry';
            case 'delete':
                if ($title && $postType) return "Deleted {$postType}: \"{$title}\"";
                return $title ? "Deleted \"{$title}\"" : 'Deleted an entry';
            case 'create_post':
            case 'publish_post':
                $verb = $action === 'publish_post' ? 'Published' : 'Created';
                $type = $postType ?? 'post';
                return $title ? "{$verb} {$type}: \"{$title}\"" : "{$verb} a {$type}";
            case 'update_post':
                $type = $postType ?? 'post';
                return $title ? "Updated {$type}: \"{$title}\"" : "Updated a {$type}";
            case 'delete_post':
                $type = $postType ?? 'post';
                return $title ? "Deleted {$type}: \"{$title}\"" : "Deleted a {$type}";
            case 'archive_post':
                $type = $postType ?? 'post';
                return $title ? "Archived {$type}: \"{$title}\"" : "Archived a {$type}";
            case 'reply_inquiry':
                return $title ? "Replied to inquiry from \"{$title}\"" : 'Replied to an inquiry';
            case 'archive_inquiry':
                return $title ? "Archived inquiry from \"{$title}\"" : 'Archived an inquiry';
            case 'update_settings':
                return 'Updated site settings';
            case 'page_view':
                return $title ? "Visited \"{$title}\"" : 'Page view';
            default:
                return $fallback ?: ucfirst(str_replace('_', ' ', $action));
        }
    }
}
