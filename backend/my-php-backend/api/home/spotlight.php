<?php
/**
 * GET/POST/PUT/DELETE /api/home/spotlight.php
 * 
 * Public (GET): Returns the active spotlight (single item)
 * Admin (GET ?all=1): Returns all spotlights
 * Admin (POST): Create new spotlight
 * Admin (PUT ?id=N): Update spotlight
 * Admin (DELETE ?id=N): Delete spotlight
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
            $all = isset($_GET['all']) && $_GET['all'] === '1';
            $result = $homeContent->getSpotlight($all);
            Response::json($result);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || empty($data['contentId'])) {
                Response::error('Content ID is required.', 400);
            }
            $featuredId = $homeContent->createSpotlight($data);
            Response::json(['message' => 'Spotlight created successfully.', 'featuredId' => (int) $featuredId], 201);
            break;

        case 'PUT':
            if (empty($_GET['id'])) {
                Response::error('Spotlight ID is required.', 400);
            }
            $id = (int) $_GET['id'];
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                Response::error('No data provided.', 400);
            }
            $success = $homeContent->updateSpotlight($id, $data);
            if ($success) {
                Response::json(['message' => 'Spotlight updated successfully.']);
            } else {
                Response::error('Failed to update spotlight.', 500);
            }
            break;

        case 'DELETE':
            if (empty($_GET['id'])) {
                Response::error('Spotlight ID is required.', 400);
            }
            $id = (int) $_GET['id'];
            $success = $homeContent->deleteSpotlight($id);
            if ($success) {
                Response::json(['message' => 'Spotlight deleted successfully.']);
            } else {
                Response::error('Failed to delete spotlight.', 500);
            }
            break;

        default:
            Response::error('Method not allowed.', 405);
    }
} catch (Exception $e) {
    error_log("home/spotlight error: " . $e->getMessage());
    Response::error('home/spotlight: ' . $e->getMessage(), 500);
}
