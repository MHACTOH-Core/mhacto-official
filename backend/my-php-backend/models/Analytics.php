<?php
/**
 * Analytics Model — Reads from existing `click_analytics` table.
 * Aggregates raw click data into page-view rankings and daily visit counts.
 */

class Analytics
{
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    /**
     * Page view rankings — aggregate click_analytics by page_path.
     * Joins with cms to get the content title.
     */
    public function getPageViews(): array
    {
        $query = "
            SELECT
                ca.page_path          AS page,
                COALESCE(c.title, ca.page_path) AS title,
                COUNT(*)              AS views,
                COALESCE(cat.label_name, 'Page') AS category
            FROM click_analytics ca
            LEFT JOIN cms c          ON ca.content_id  = c.content_id
            LEFT JOIN catergory cat  ON c.category_id  = cat.category_id
            GROUP BY ca.page_path, c.title, cat.label_name
            ORDER BY views DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Daily visit counts — aggregate click_analytics by date.
     */
    public function getDailyVisits(int $days = 30): array
    {
        $query = "
            SELECT
                DATE(clicked_at) AS date,
                COUNT(*)         AS views
            FROM click_analytics
            WHERE clicked_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
            GROUP BY DATE(clicked_at)
            ORDER BY date ASC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':days', $days, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Record a click event. */
    public function trackClick(int $contentId, string $pagePath, ?string $visitorIp = null): void
    {
        $query = "INSERT INTO click_analytics (content_id, page_path, visitor_ip)
                  VALUES (:content_id, :page_path, :visitor_ip)";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([
            ':content_id'  => $contentId,
            ':page_path'   => $pagePath,
            ':visitor_ip'  => $visitorIp ?? ($_SERVER['REMOTE_ADDR'] ?? null),
        ]);
    }
}
