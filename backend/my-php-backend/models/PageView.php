<?php
namespace App\Models;

use PDO;

/**
 * PageView Model — Per-destination click analytics.
 *
 * Reads / writes to the `page_views` table which references
 * `content` (post_type = 'place') for destination data and
 * `category` for the destination's category label.
 *
 * All queries use parameterised statements to prevent SQL injection.
 */

class PageView
{
    /** @var PDO Database connection */
    private PDO $conn;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    // ─── POST: Log a single page view ─────────────────────────────

    /**
     * Record a click / view for a specific destination.
     *
     * @param int         $contentId  The `content.content_id` of the destination.
     * @param string|null $sessionId  Optional visitor session token for de-duplication.
     * @return bool  True if the row was inserted successfully.
     */
    public function logView(int $contentId, ?string $sessionId = null): bool
    {
        /*
         * Lightweight INSERT — only stores the FK and an optional session token.
         * `clicked_at` defaults to CURRENT_TIMESTAMP in the schema so we
         * don't need to send it explicitly, keeping the payload minimal.
         */
        $query = "
            INSERT INTO page_views (content_id, visitor_session_id)
            VALUES (:content_id, :session_id)
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':content_id', $contentId, PDO::PARAM_INT);
        $stmt->bindParam(':session_id', $sessionId, PDO::PARAM_STR);

        return $stmt->execute();
    }

    // ─── GET: Top 10 most-clicked destinations ────────────────────

    /**
     * Aggregate page_views and JOIN with content + category to produce
     * a ranked list of the 10 most popular destinations.
     *
     * Returned columns:
     *   content_id, destination_name, category, total_clicks
     *
     * The query filters `post_type = 'place'` to guarantee only
     * destination rows are included, even if a non-place content_id
     * was accidentally tracked.
     *
     * @param int $limit  Number of top results (default 10).
     * @return array<int, array{content_id: int, destination_name: string, category: string, total_clicks: int}>
     */
    public function getTopDestinations(int $limit = 10): array
    {
        $query = "
            SELECT
                c.content_id,
                c.title                                  AS destination_name,
                COALESCE(cat.label_name, 'Uncategorized') AS category,
                COUNT(pv.view_id)                        AS total_clicks
            FROM page_views pv
            INNER JOIN content  c   ON pv.content_id  = c.content_id
            LEFT  JOIN categories cat ON c.category_id  = cat.category_id
            WHERE c.post_type = 'place'
            GROUP BY c.content_id, c.title, cat.label_name
            ORDER BY total_clicks DESC
            LIMIT :view_limit
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':view_limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
