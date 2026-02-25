<?php
/**
 * GET /api/analytics/pageviews.php
 * Returns: array of page view objects
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('GET');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Analytics.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $analytics = new Analytics($db);

    Response::json($analytics->getPageViews());
} catch (Exception $e) {
    error_log("analytics/pageviews error: " . $e->getMessage());
    Response::error('Failed to fetch page views.', 500);
}
