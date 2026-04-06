<?php
namespace App\Models;

use PDO;

/**
 * Analytics Model — Schema v2.
 * Page views now live in `activity_logs` (action = 'page_view').
 * Joins with `content` and `category` (was `categories`).
 */

class Analytics
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    /**
     * Page view rankings — aggregate activity_logs by page_path.
     * Joins with content to get the content title.
     */
    public function getPageViews(): array
    {
        $query = "
            SELECT
                al.page_path                          AS page,
                COALESCE(c.title, al.page_path)       AS title,
                COUNT(*)                              AS views,
                COALESCE(cat.label_name, 'Page')      AS category
            FROM activity_logs al
            LEFT JOIN content  c   ON al.content_id  = c.content_id
            LEFT JOIN categories cat ON c.category_id  = cat.category_id
            WHERE al.action = 'page_view'
            GROUP BY al.page_path, c.title, cat.label_name
            ORDER BY views DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Daily visit counts — aggregate page_view events by date.
     */
    public function getDailyVisits(int $days = 30): array
    {
        $query = "
            SELECT
                DATE(created_at) AS date,
                COUNT(*)         AS views
            FROM activity_logs
            WHERE action = 'page_view'
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':days', $days, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Record a page view event. */
    public function trackClick(int $contentId, string $pagePath, ?string $visitorIp = null): void
    {
        $query = "
            INSERT INTO activity_logs (user_id, content_id, action, page_path, ip_address)
            VALUES (NULL, :content_id, 'page_view', :page_path, :ip)
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([
            ':content_id' => $contentId,
            ':page_path'  => $pagePath,
            ':ip'         => $visitorIp ?? ($_SERVER['REMOTE_ADDR'] ?? null),
        ]);
    }
}
