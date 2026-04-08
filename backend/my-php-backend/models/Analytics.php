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
     * Page view rankings — aggregate page_views by content.
     * Joins with content and categories to get the title, category,
     * and (when available) the recorded URL path from activity_logs.
     */
    public function getPageViews(): array
    {
        $query = "
            SELECT
                COALESCE(al_path.page_path, CONCAT('/content/', c.content_id)) AS page,
                c.title                                  AS title,
                COUNT(pv.view_id)                        AS views,
                COALESCE(cat.label_name, 'Page')         AS category
            FROM page_views pv
            INNER JOIN content      c   ON pv.content_id  = c.content_id
            LEFT  JOIN categories   cat ON c.category_id  = cat.category_id
            LEFT  JOIN (
                SELECT content_id, MIN(page_path) AS page_path
                FROM activity_logs
                WHERE action = 'page_view' AND page_path IS NOT NULL
                GROUP BY content_id
            ) al_path ON al_path.content_id = c.content_id
            WHERE c.status = 'published'
            GROUP BY c.content_id, c.title, cat.label_name, al_path.page_path
            ORDER BY views DESC
            LIMIT 20
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
}
