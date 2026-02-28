<?php
/**
 * POST /api/activity/log.php
 * Body: { action, description }
 * Logs an admin activity.
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('POST');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/ActivityLog.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $log = new ActivityLog($db);

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['action']) || empty($data['description'])) {
        Response::error('Action and description are required.', 400);
    }

    $entry = $log->log(
        $data['action'],
        $data['description'],
        $data['userId'] ?? null,
        null,
        $data['contentId'] ?? null
    );

    if ($entry) {
        Response::json($entry, 201);
    } else {
        Response::error('Failed to log activity.', 500);
    }
} catch (Exception $e) {
    error_log("activity/log error: " . $e->getMessage());
    Response::error('Failed to log activity.', 500);
}
