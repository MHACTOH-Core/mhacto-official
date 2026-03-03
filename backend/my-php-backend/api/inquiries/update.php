<?php
/**
 * PUT|POST /api/inquiries/update.php?id=123
 * Body: { status: 'unread' | 'in_progress' | 'resolved' | 'archived' }
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();

// Accept both PUT and POST for compatibility with PHP built-in server
$method = $_SERVER['REQUEST_METHOD'];
if (!in_array($method, ['PUT', 'POST', 'PATCH'], true)) {
    Response::error('Method not allowed. Use PUT or POST.', 405);
}

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

    $raw = file_get_contents('php://input');
    $data = $raw ? json_decode($raw, true) : null;
    if (!$data || !isset($data['status'])) {
        Response::error('Status is required.', 400);
    }

    $allowed = ['unread', 'in_progress', 'resolved', 'archived'];
    if (!in_array($data['status'], $allowed, true)) {
        Response::error('Invalid status. Allowed: ' . implode(', ', $allowed), 400);
    }

    $success = $inquiry->update($id, ['status' => $data['status']]);
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
    Response::error('Failed to update inquiry: ' . $e->getMessage(), 500);
}
