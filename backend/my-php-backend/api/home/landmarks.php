<?php
/**
 * GET/POST/PUT/DELETE /api/home/landmarks.php
 * 
 * Public (GET): Returns active featured landmarks
 * Admin (GET ?all=1): Returns all featured landmarks
 * Admin (POST): Create new landmark
 * Admin (PUT ?id=N): Update landmark
 * Admin (DELETE ?id=N): Delete landmark
 * Admin (PATCH): Reorder landmarks
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
            $landmarks = $homeContent->getFeaturedLandmarks($all);
            Response::json($landmarks);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || empty($data['contentId'])) {
                Response::error('Content ID is required.', 400);
            }
            $featuredId = $homeContent->createFeaturedLandmark($data);
            Response::json(['message' => 'Featured landmark created successfully.', 'featuredId' => (int) $featuredId], 201);
            break;

        case 'PUT':
            if (empty($_GET['id'])) {
                Response::error('Landmark ID is required.', 400);
            }
            $id = (int) $_GET['id'];
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                Response::error('No data provided.', 400);
            }
            $success = $homeContent->updateFeaturedLandmark($id, $data);
            if ($success) {
                Response::json(['message' => 'Featured landmark updated successfully.']);
            } else {
                Response::error('Failed to update featured landmark.', 500);
            }
            break;

        case 'DELETE':
            if (empty($_GET['id'])) {
                Response::error('Landmark ID is required.', 400);
            }
            $id = (int) $_GET['id'];
            $success = $homeContent->deleteFeaturedLandmark($id);
            if ($success) {
                Response::json(['message' => 'Featured landmark deleted successfully.']);
            } else {
                Response::error('Failed to delete featured landmark.', 500);
            }
            break;

        case 'PATCH':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || empty($data['order'])) {
                Response::error('Reorder array is required.', 400);
            }
            $success = $homeContent->reorderFeaturedLandmarks($data['order']);
            if ($success) {
                Response::json(['message' => 'Landmarks reordered successfully.']);
            } else {
                Response::error('Failed to reorder landmarks.', 500);
            }
            break;

        default:
            Response::error('Method not allowed.', 405);
    }
} catch (Exception $e) {
    error_log("home/landmarks error: " . $e->getMessage());
    Response::error('home/landmarks: ' . $e->getMessage(), 500);
}
