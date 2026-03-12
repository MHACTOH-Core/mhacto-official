<?php
/**
 * GET/POST/PUT/PATCH/DELETE /api/home/milestones.php
 * 
 * Public (GET): Returns active milestones in sort order
 * Admin (GET ?all=1): Returns all milestones
 * Admin (POST): Create new milestone
 * Admin (PUT ?id=N): Update milestone
 * Admin (PATCH): Reorder milestones (body: { order: [id1, id2, ...] })
 * Admin (DELETE ?id=N): Delete milestone
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
            $milestones = $homeContent->getMilestones($all);
            Response::json($milestones);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || empty($data['title']) || empty($data['year'])) {
                Response::error('Title and year are required.', 400);
            }
            $milestoneId = $homeContent->createMilestone($data);
            Response::json(['message' => 'Milestone created successfully.', 'milestoneId' => (int) $milestoneId], 201);
            break;

        case 'PUT':
            if (empty($_GET['id'])) {
                Response::error('Milestone ID is required.', 400);
            }
            $id = (int) $_GET['id'];
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                Response::error('No data provided.', 400);
            }
            $success = $homeContent->updateMilestone($id, $data);
            if ($success) {
                Response::json(['message' => 'Milestone updated successfully.']);
            } else {
                Response::error('Failed to update milestone.', 500);
            }
            break;

        case 'PATCH':
            // Reorder milestones
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || !isset($data['order']) || !is_array($data['order'])) {
                Response::error('Order array is required.', 400);
            }
            $success = $homeContent->reorderMilestones($data['order']);
            if ($success) {
                Response::json(['message' => 'Milestones reordered successfully.']);
            } else {
                Response::error('Failed to reorder milestones.', 500);
            }
            break;

        case 'DELETE':
            if (empty($_GET['id'])) {
                Response::error('Milestone ID is required.', 400);
            }
            $id = (int) $_GET['id'];
            $success = $homeContent->deleteMilestone($id);
            if ($success) {
                Response::json(['message' => 'Milestone deleted successfully.']);
            } else {
                Response::error('Failed to delete milestone.', 500);
            }
            break;

        default:
            Response::error('Method not allowed.', 405);
    }
} catch (Exception $e) {
    error_log("home/milestones error: " . $e->getMessage());
    Response::error('home/milestones: ' . $e->getMessage(), 500);
}
