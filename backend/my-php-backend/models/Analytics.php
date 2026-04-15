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
     *
     * @param int|null $limit      Max rows to return. null = no limit (return all).
     * @param string   $sortBy     Column to sort by: 'views', 'title', or 'category'.
     * @param string   $sortOrder  'ASC' or 'DESC'.
     * @param string|null $startDate Filter views from this date (YYYY-MM-DD), inclusive.
     * @param string|null $endDate   Filter views up to this date (YYYY-MM-DD), inclusive.
     */
    public function getPageViews(
        ?int   $limit     = 20,
        string $sortBy    = 'views',
        string $sortOrder = 'DESC',
        ?string $startDate = null,
        ?string $endDate   = null
    ): array {
        // Whitelist sort params to prevent SQL injection
        $allowedSort  = ['views', 'title', 'category', 'page'];
        $sortBy       = in_array($sortBy, $allowedSort, true) ? $sortBy : 'views';
        $sortOrder    = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

        $dateWhere = '';
        $params    = [];

        if ($startDate) {
            $dateWhere .= " AND al.created_at >= :start_date";
            $params[':start_date'] = $startDate . ' 00:00:00';
        }
        if ($endDate) {
            $dateWhere .= " AND al.created_at <= :end_date";
            $params[':end_date'] = $endDate . ' 23:59:59';
        }

        $limitClause = $limit !== null ? "LIMIT :limit" : "";

        // Aggregate from activity_logs using content_id (always present on log-view).
        // page_path is used when available; falls back to a constructed path.
        $query = "
            SELECT
                COALESCE(MIN(al.page_path), CONCAT('/content/', al.content_id)) AS page,
                COALESCE(c.title, CONCAT('Content #', al.content_id))           AS title,
                COUNT(*)                                                         AS views,
                COALESCE(cat.label_name, 'General')                             AS category
            FROM activity_logs al
            LEFT JOIN content      c   ON al.content_id  = c.content_id
            LEFT JOIN categories   cat ON c.category_id  = cat.category_id
            WHERE al.action = 'page_view'
              AND al.content_id IS NOT NULL
              $dateWhere
            GROUP BY al.content_id, c.title, cat.label_name
            ORDER BY $sortBy $sortOrder
            $limitClause
        ";

        $stmt = $this->conn->prepare($query);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        if ($limit !== null) {
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        }

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

    /**
     * Daily visit counts filtered by an explicit date range.
     *
     * @param string $startDate  YYYY-MM-DD (inclusive)
     * @param string $endDate    YYYY-MM-DD (inclusive)
     */
    public function getDailyVisitsByRange(string $startDate, string $endDate): array
    {
        $query = "
            SELECT
                DATE(created_at) AS date,
                COUNT(*)         AS views
            FROM activity_logs
            WHERE action = 'page_view'
              AND DATE(created_at) >= :start_date
              AND DATE(created_at) <= :end_date
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':start_date', $startDate);
        $stmt->bindParam(':end_date',   $endDate);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
