<?php
/**
 * GET /api/analytics/visits.php
 * Optional query params: ?days=30
 * Returns: array of { date, views } objects
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

    $days = isset($_GET['days']) ? (int)$_GET['days'] : 30;

    Response::json($analytics->getDailyVisits($days));
} catch (Exception $e) {
    error_log("analytics/visits error: " . $e->getMessage());
    Response::error('Failed to fetch daily visits.', 500);
}
