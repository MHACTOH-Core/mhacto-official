<?php
/**
 * PUT|POST /api/inquiries/update.php?id=123
 * Body: { status?: 'unread' | 'assigned' | 'archived' | 'spam' | 'trash',
 *         assigned_to?: string  (tourist guide name/ID) }
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
    if (!$data) {
        Response::error('Request body is required.', 400);
    }

    $updatePayload = [];

    // Status update
    if (isset($data['status'])) {
        $allowed = ['unread', 'assigned', 'archived', 'spam', 'trash'];
        if (!in_array($data['status'], $allowed, true)) {
            Response::error('Invalid status. Allowed: ' . implode(', ', $allowed), 400);
        }
        $updatePayload['status'] = $data['status'];
    }

    // Assignment update
    if (array_key_exists('assigned_to', $data)) {
        $updatePayload['assigned_to'] = $data['assigned_to'] ? trim($data['assigned_to']) : null;
    }

    if (empty($updatePayload)) {
        Response::error('No updatable fields provided (status, assigned_to).', 400);
    }

    $success = $inquiry->update($id, $updatePayload);
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
