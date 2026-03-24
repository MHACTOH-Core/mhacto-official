<?php
use App\Config\Database;
use App\Models\Analytics;
use App\Models\PageView;
use App\Core\Auth;
use App\Core\Response;

/**
 * Route: /api/analytics
 *
 * GET  /api/analytics/pageviews          — page view stats
 * GET  /api/analytics/visits             — daily visit counts (?days=30)
 * GET  /api/analytics/top-destinations   — top clicked destinations (?limit=10)
 * GET  /api/analytics/visitor-summary    — walk-ins, bookings, assignments summary
 * POST /api/analytics/log-view           — log a destination page view
 */

function handle_analytics(string $method, ?string $action): void
{
    try {
        $db = (new Database())->getConnection();

        switch ($action) {
            case 'pageviews':
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireRole(['super_admin', 'admin']);
                $analytics = new Analytics($db);
                Response::json($analytics->getPageViews());
                break;

            case 'visits':
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireRole(['super_admin', 'admin']);
                $analytics = new Analytics($db);
                $days = isset($_GET['days']) ? (int) $_GET['days'] : 30;
                Response::json($analytics->getDailyVisits($days));
                break;

            case 'top-destinations':
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireRole(['super_admin', 'admin']);
                $pageView = new PageView($db);
                $limit = isset($_GET['limit']) ? max(1, min((int) $_GET['limit'], 50)) : 10;
                Response::json($pageView->getTopDestinations($limit));
                break;

            case 'visitor-summary':
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireRole(['super_admin', 'admin']);
                $days = isset($_GET['days']) ? max(1, (int) $_GET['days']) : 30;
                _visitor_summary($db, $days);
                break;

            case 'log-view':
                // Public endpoint — no auth required (visitor tracking)
                if ($method !== 'POST') Response::error('Method not allowed. Use POST.', 405);
                $input = Response::getJsonInput();
                if (!$input || empty($input->contentId) || !is_numeric($input->contentId)) {
                    Response::error('Missing or invalid "contentId".', 400);
                }
                $pageView = new PageView($db);
                $pageView->logView(
                    (int) $input->contentId,
                    isset($input->sessionId) ? trim((string) $input->sessionId) : null
                );
                Response::json(['message' => 'View logged.'], 201);
                break;

            default:
                Response::error('Unknown analytics action.', 404);
        }
    } catch (Exception $e) {
        error_log("analytics error: " . $e->getMessage());
        Response::error('An internal error occurred.', 500);
    }
}

// ── Visitor Summary ─────────────────────────────────────────────────

function _visitor_summary(PDO $db, int $days): void
{
    $since = date('Y-m-d', strtotime("-{$days} days"));

    // Count inquiries by status within date range
    $stmt = $db->prepare("
        SELECT
            SUM(inquiry_type = 'walk_in')                               AS walk_ins,
            SUM(status IN ('read','archived') AND inquiry_type = 'tour_booking') AS bookings_completed,
            SUM(status IN ('unread','in_progress') AND inquiry_type = 'tour_booking') AS bookings_pending,
            SUM(status = 'assigned')                                    AS guide_assigned
        FROM inquiries
        WHERE created_at >= :since
          AND status NOT IN ('spam','trash')
    ");
    $stmt->execute([':since' => $since]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    // Daily breakdown for chart
    $daily = $db->prepare("
        SELECT
            DATE(created_at) AS date,
            SUM(inquiry_type = 'walk_in')                               AS walk_ins,
            SUM(inquiry_type = 'tour_booking' AND status IN ('read','archived')) AS bookings_completed,
            SUM(inquiry_type = 'tour_booking' AND status IN ('unread','in_progress')) AS bookings_pending,
            SUM(status = 'assigned')                                    AS guide_assigned
        FROM inquiries
        WHERE created_at >= :since
          AND status NOT IN ('spam','trash')
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
    ");
    $daily->execute([':since' => $since]);
    $dailyRows = $daily->fetchAll(PDO::FETCH_ASSOC);

    Response::json([
        'totals' => [
            'walkIns'            => (int) ($row['walk_ins'] ?? 0),
            'bookingsCompleted'  => (int) ($row['bookings_completed'] ?? 0),
            'bookingsPending'    => (int) ($row['bookings_pending'] ?? 0),
            'guideAssigned'      => (int) ($row['guide_assigned'] ?? 0),
        ],
        'daily' => array_map(fn($r) => [
            'date'              => $r['date'],
            'walkIns'           => (int) $r['walk_ins'],
            'bookingsCompleted' => (int) $r['bookings_completed'],
            'bookingsPending'   => (int) $r['bookings_pending'],
            'guideAssigned'     => (int) $r['guide_assigned'],
        ], $dailyRows),
    ]);
}
