<?php
/**
 * GET /api/activity/read.php
 * Optional query params: ?limit=50
 * Returns: array of activity log entries
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('GET');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/ActivityLog.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $log = new ActivityLog($db);

    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

    Response::json($log->readAll($limit));
} catch (Exception $e) {
    error_log("activity/read error: " . $e->getMessage());
    Response::error('Failed to fetch activity log.', 500);
}
