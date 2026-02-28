<?php
/**
 * POST /api/inquiries/reply.php?id=123
 * Body: { message: "Reply text..." }
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('POST');

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
    if (!$data || empty($data['message'])) {
        Response::error('Reply message is required.', 400);
    }

    $success = $inquiry->reply($id, $data['message']);
    if ($success) {
        $updated = $inquiry->readOne($id);
        Response::json([
            'message'  => 'Reply sent successfully.',
            'inquiry'  => $updated,
        ]);
    } else {
        Response::error('Failed to send reply.', 500);
    }
} catch (Exception $e) {
    error_log("inquiries/reply error: " . $e->getMessage());
    Response::error('Failed to send reply.', 500);
}
