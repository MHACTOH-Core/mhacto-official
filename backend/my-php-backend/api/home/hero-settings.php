<?php
/**
 * GET/PUT /api/home/hero-settings.php
 * 
 * Public/Admin (GET): Returns hero settings
 * Admin (PUT): Update hero settings
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/HomeContent.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $homeContent = new HomeContent($db);

    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            $settings = $homeContent->getHeroSettings();
            Response::json($settings);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                Response::error('No data provided.', 400);
            }
            $success = $homeContent->updateHeroSettings($data);
            if ($success) {
                Response::json(['message' => 'Hero settings updated successfully.']);
            } else {
                Response::error('Failed to update hero settings.', 500);
            }
            break;

        default:
            Response::error('Method not allowed.', 405);
    }
} catch (Exception $e) {
    error_log("home/hero-settings error: " . $e->getMessage());
    Response::error('An error occurred.', 500);
}
