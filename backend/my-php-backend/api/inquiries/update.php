<?php
/**
 * PUT /api/inquiries/update.php?id=123
 * Body: { status, isRead, isAssigned, folder, ... }
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('PUT');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Inquiry.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $inquiry = new Inquiry($db);

    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        Response::error('Missing inquiry ID.', 400);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        Response::error('No data provided.', 400);
    }

    $success = $inquiry->update($id, $data);
    if ($success) {
        $updated = $inquiry->readOne($id);
        Response::json([
            'message' => 'Inquiry updated successfully.',
            'inquiry' => $updated,
        ]);
    } else {
        Response::error('Failed to update inquiry.', 500);
    }
} catch (Exception $e) {
    error_log("inquiries/update error: " . $e->getMessage());
    Response::error('Failed to update inquiry.', 500);
}
