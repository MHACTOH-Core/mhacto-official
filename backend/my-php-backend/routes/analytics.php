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
 * POST /api/analytics/log-view           — log a destination page view
 */

function handle_analytics(string $method, ?string $action): void
{
    try {
        $db = (new Database())->getConnection();

        switch ($action) {
            case 'pageviews':
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireAuth();
                $analytics = new Analytics($db);
                Response::json($analytics->getPageViews());
                break;

            case 'visits':
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireAuth();
                $analytics = new Analytics($db);
                $days = isset($_GET['days']) ? (int) $_GET['days'] : 30;
                Response::json($analytics->getDailyVisits($days));
                break;

            case 'top-destinations':
                if ($method !== 'GET') Response::error('Method not allowed. Use GET.', 405);
                Auth::requireAuth();
                $pageView = new PageView($db);
                $limit = isset($_GET['limit']) ? max(1, min((int) $_GET['limit'], 50)) : 10;
                Response::json($pageView->getTopDestinations($limit));
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
