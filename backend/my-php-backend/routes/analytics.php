<?php
use App\Config\Database;
use App\Models\Analytics;
use App\Models\PageView;
use App\Models\ActivityLog;
use App\Core\Auth;
use App\Core\Response;
use App\Core\RateLimit;

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
                Auth::requireRole(['super_admin', 'admin', 'content_manager']);
                $analytics = new Analytics($db);
                Response::json($analytics->getPageViews());
                break;

            case 'visits':
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireRole(['super_admin', 'admin', 'content_manager']);
                $analytics = new Analytics($db);
                $days = isset($_GET['days']) ? (int) $_GET['days'] : 30;
                Response::json($analytics->getDailyVisits($days));
                break;

            case 'top-destinations':
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireRole(['super_admin', 'admin', 'content_manager']);
                $pageView = new PageView($db);
                $limit = isset($_GET['limit']) ? max(1, min((int) $_GET['limit'], 50)) : 10;
                Response::json($pageView->getTopDestinations($limit));
                break;

            case 'visitor-summary':
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireRole(['super_admin', 'admin', 'content_manager']);
                $days = isset($_GET['days']) ? max(1, (int) $_GET['days']) : 30;
                Response::json(_visitor_summary_data($db, $days));
                break;

            case 'log-view':
                // Public endpoint — no auth required (visitor tracking)
                // Rate-limit: max 60 page-view logs per IP per minute (bot protection)
                RateLimit::check('log_view', 60, 60);
                if ($method !== 'POST') Response::error('Method not allowed. Use POST.', 405);
                $input = Response::getJsonInput();
                if (!$input || empty($input->contentId) || !is_numeric($input->contentId)) {
                    Response::error('Missing or invalid "contentId".', 400);
                }
                $contentId = (int) $input->contentId;
                $sessionId = isset($input->sessionId) ? trim((string) $input->sessionId) : null;
                $pagePath  = isset($input->pagePath)  ? trim((string) $input->pagePath)  : null;

                // Write to page_views table (for top-destinations ranking)
                $pageView = new PageView($db);
                $pageView->logView($contentId, $sessionId);

                // Write to activity_logs table (for dashboard analytics charts)
                $actLog = new ActivityLog($db);
                $actLog->log('page_view', json_encode(['contentId' => $contentId]), null, null, $contentId, $pagePath);

                Response::json(['message' => 'View logged.'], 201);
                break;

            case 'dashboard':
                // Combined endpoint: returns pageviews + daily visits + visitor summary in one request
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireRole(['super_admin', 'admin', 'content_manager']);
                $days = isset($_GET['days']) ? max(1, (int) $_GET['days']) : 30;
                $analytics = new Analytics($db);
                Response::json([
                    'pageViews'       => $analytics->getPageViews(),
                    'dailyVisits'     => $analytics->getDailyVisits($days),
                    'visitorSummary'  => _visitor_summary_data($db, $days),
                ]);
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

function _visitor_summary_data(PDO $db, int $days): array
{
    $since = date('Y-m-d', strtotime("-{$days} days"));

    // Count inquiries by status within date range
    $stmt = $db->prepare("
        SELECT
            SUM(inquiry_type = 'walk_in')                               AS walk_ins,
            SUM(status IN ('completed','archived') AND inquiry_type = 'tour_booking') AS bookings_completed,
            SUM(status IN ('unread','read','assigned','confirmed') AND inquiry_type = 'tour_booking') AS bookings_pending,
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
            SUM(inquiry_type = 'tour_booking' AND status IN ('completed','archived')) AS bookings_completed,
            SUM(inquiry_type = 'tour_booking' AND status IN ('unread','read','assigned','confirmed')) AS bookings_pending,
            SUM(status = 'assigned')                                    AS guide_assigned
        FROM inquiries
        WHERE created_at >= :since
          AND status NOT IN ('spam','trash')
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
    ");
    $daily->execute([':since' => $since]);
    $dailyRows = $daily->fetchAll(PDO::FETCH_ASSOC);

    return [
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
    ];
}
