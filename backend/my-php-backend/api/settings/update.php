<?php
/**
 * PUT /api/settings/update.php
 * Body: { siteName, contactEmail, ... }
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('PUT');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Settings.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $settings = new Settings($db);

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        Response::error('No data provided.', 400);
    }

    $updated = $settings->update($data);
    Response::json([
        'message'  => 'Settings updated successfully.',
        'settings' => $updated,
    ]);
} catch (Exception $e) {
    error_log("settings/update error: " . $e->getMessage());
    Response::error('Failed to update settings.', 500);
}
