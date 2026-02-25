<?php
/**
 * GET /api/settings/read.php
 * Returns: settings object
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('GET');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Settings.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $settings = new Settings($db);

    Response::json($settings->read());
} catch (Exception $e) {
    error_log("settings/read error: " . $e->getMessage());
    Response::error('Failed to fetch settings.', 500);
}
