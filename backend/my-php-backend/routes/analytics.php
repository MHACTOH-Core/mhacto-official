<?php
use App\Config\Database;
use App\Models\Analytics;
use App\Models\PageView;
use App\Models\ActivityLog;
use App\Core\Auth;
use App\Core\Response;
use App\Core\RateLimit;
use App\Core\QueryCache;

/**
 * Route: /api/analytics
 *
 * GET  /api/analytics/content-stats      — page view stats  (aliased from 'pageviews' to bypass ad-blockers)
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
            case 'content-stats':
            case 'pageviews':  // keep legacy alias
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireRole(['super_admin', 'admin', 'content_manager']);
                $analytics  = new Analytics($db);
                $allRows    = isset($_GET['all']) && $_GET['all'] === '1';
                $limit      = $allRows ? null : (isset($_GET['limit']) ? max(1, min((int) $_GET['limit'], 500)) : 20);
                $sortBy     = $_GET['sort_by']    ?? 'views';
                $sortOrder  = $_GET['sort_order'] ?? 'DESC';
                $startDate  = isset($_GET['start_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['start_date']) ? $_GET['start_date'] : null;
                $endDate    = isset($_GET['end_date'])   && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['end_date'])   ? $_GET['end_date']   : null;
                Response::json($analytics->getPageViews($limit, $sortBy, $sortOrder, $startDate, $endDate));
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
                $startDate = isset($_GET['start_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['start_date']) ? $_GET['start_date'] : null;
                $endDate   = isset($_GET['end_date'])   && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['end_date'])   ? $_GET['end_date']   : null;
                if (!$startDate && !$endDate) {
                    $days = isset($_GET['days']) ? max(1, (int) $_GET['days']) : 30;
                    $startDate = date('Y-m-d', strtotime("-{$days} days"));
                    $endDate   = date('Y-m-d');
                }
                Response::json(_visitor_summary_data($db, $startDate, $endDate));
                break;

            case 'log-view':
                // Public endpoint — no auth required (visitor tracking)
                if ($method !== 'POST') Response::error('Method not allowed. Use POST.', 405);
                // Rate-limit: max 60 page-view logs per IP per minute (bot protection)
                RateLimit::check('log_view', 60, 60);
                $input = Response::getJsonInput();
                if (!$input || empty($input->contentId) || !is_numeric($input->contentId)) {
                    Response::error('Missing or invalid "contentId".', 400);
                }
                $contentId = (int) $input->contentId;
                $sessionId = isset($input->sessionId) ? mb_substr(trim((string) $input->sessionId), 0, 128) : null;
                $pagePath  = isset($input->pagePath)  ? mb_substr(trim((string) $input->pagePath),  0, 500) : null;

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
                $startDate = isset($_GET['start_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['start_date']) ? $_GET['start_date'] : null;
                $endDate   = isset($_GET['end_date'])   && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['end_date'])   ? $_GET['end_date']   : null;
                if (!$startDate && !$endDate) {
                    $days = isset($_GET['days']) ? max(1, (int) $_GET['days']) : 30;
                    $startDate = date('Y-m-d', strtotime("-{$days} days"));
                    $endDate   = date('Y-m-d');
                }
                $analytics = new Analytics($db);
                QueryCache::noCacheHeaders(); // admin-only, always fresh
                Response::json([
                    'pageViews'      => $analytics->getPageViews(null, 'views', 'DESC', $startDate, $endDate),
                    'dailyVisits'    => $analytics->getDailyVisitsByRange($startDate, $endDate),
                    'visitorSummary' => _visitor_summary_data($db, $startDate, $endDate),
                ]);
                break;

            case 'visitor-details':
                // Detailed per-person visitor engagement list (inquiries)
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireRole(['super_admin', 'admin', 'content_manager']);
                $sortBy    = $_GET['sort_by']    ?? 'created_at';
                $sortOrder = $_GET['sort_order'] ?? 'DESC';
                $startDate = isset($_GET['start_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['start_date']) ? $_GET['start_date'] : null;
                $endDate   = isset($_GET['end_date'])   && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['end_date'])   ? $_GET['end_date']   : null;
                $type      = isset($_GET['type']) ? trim($_GET['type']) : null;
                $status    = isset($_GET['status']) ? trim($_GET['status']) : null;
                Response::json(_visitor_details_list($db, $sortBy, $sortOrder, $startDate, $endDate, $type, $status));
                break;

            default:
                Response::error('Unknown analytics action.', 404);
        }
    } catch (\Throwable $e) {
        error_log("analytics error [" . get_class($e) . "]: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
        Response::error('An internal error occurred: ' . $e->getMessage(), 500);
    }
}

// ── Visitor Summary ─────────────────────────────────────────────────

function _visitor_summary_data(PDO $db, string $startDate, string $endDate): array
{
    $params = [':start_date' => $startDate, ':end_date' => $endDate];

    // Count inquiries by status within date range
    $stmt = $db->prepare("
        SELECT
            SUM(inquiry_type = 'walk_in')                               AS walk_ins,
            SUM(status IN ('completed','archived') AND inquiry_type = 'tour_booking') AS bookings_completed,
            SUM(status IN ('unread','read','assigned','confirmed') AND inquiry_type = 'tour_booking') AS bookings_pending,
            SUM(status = 'assigned')                                    AS guide_assigned
        FROM inquiries
        WHERE DATE(created_at) >= :start_date
          AND DATE(created_at) <= :end_date
          AND status NOT IN ('spam','trash')
    ");
    $stmt->execute($params);
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
        WHERE DATE(created_at) >= :start_date
          AND DATE(created_at) <= :end_date
          AND status NOT IN ('spam','trash')
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
    ");
    $daily->execute($params);
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

// ── Visitor Details — per-person engagement list ────────────────────

function _visitor_details_list(
    PDO     $db,
    string  $sortBy,
    string  $sortOrder,
    ?string $startDate,
    ?string $endDate,
    ?string $type,
    ?string $status
): array {
    // Whitelist sort columns
    $allowedSort = [
        'created_at' => 'i.created_at',
        'full_name'  => 'i.full_name',
        'type'       => 'i.inquiry_type',
        'status'     => 'i.status',
        'pax'        => 'i.number_of_pax',
        'date_of_visit' => 'i.date_of_visit',
    ];
    $orderCol  = $allowedSort[$sortBy] ?? 'i.created_at';
    $sortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';

    $where  = "WHERE i.status NOT IN ('spam','trash')";
    $params = [];

    if ($startDate) {
        $where .= " AND i.created_at >= :start_date";
        $params[':start_date'] = $startDate . ' 00:00:00';
    }
    if ($endDate) {
        $where .= " AND i.created_at <= :end_date";
        $params[':end_date'] = $endDate . ' 23:59:59';
    }
    if ($type) {
        $where .= " AND i.inquiry_type = :type";
        $params[':type'] = $type;
    }
    if ($status) {
        $where .= " AND i.status = :status";
        $params[':status'] = $status;
    }

    $query = "
        SELECT
            i.inquiry_id    AS id,
            i.full_name     AS fullName,
            i.tourist_name  AS touristName,
            i.email_address AS email,
            i.contact_number AS contactNumber,
            i.inquiry_type  AS type,
            i.status,
            i.number_of_pax AS pax,
            i.date_of_visit AS dateOfVisit,
            i.confirmed_date AS confirmedDate,
            COALESCE(tg.full_name, i.assigned_to) AS assignedGuide,
            i.message,
            i.created_at    AS createdAt
        FROM inquiries i
        LEFT JOIN tour_guides tg ON tg.guide_id = i.assigned_guide_id
        $where
        ORDER BY $orderCol $sortOrder
    ";

    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();

    return array_map(function ($r) {
        return [
            'id'            => (int) $r['id'],
            'fullName'      => $r['fullName'],
            'touristName'   => $r['touristName'],
            'email'         => $r['email'],
            'contactNumber' => $r['contactNumber'],
            'type'          => $r['type'],
            'status'        => $r['status'],
            'pax'           => $r['pax'] !== null ? (int) $r['pax'] : null,
            'dateOfVisit'   => $r['dateOfVisit'],
            'confirmedDate' => $r['confirmedDate'],
            'assignedGuide' => $r['assignedGuide'],
            'message'       => $r['message'],
            'createdAt'     => $r['createdAt'],
        ];
    }, $stmt->fetchAll(PDO::FETCH_ASSOC));
}
