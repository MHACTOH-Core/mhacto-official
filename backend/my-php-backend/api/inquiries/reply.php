<?php
/**
 * POST /api/inquiries/reply.php?id=123
 *
 * Saves an admin reply to an inquiry (in-app reply thread).
 * Body: { reply_text: string, replied_by?: string }
 *
 * Stores the reply in the inquiries table (reply_text, replied_at, replied_by).
 * The frontend also opens mailto: for the actual email delivery — this
 * endpoint only persists the reply record for in-app display and audit.
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed. Use POST.', 405);
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
    if (!$data || empty(trim($data['reply_text'] ?? ''))) {
        Response::error('reply_text is required.', 400);
    }

    $success = $inquiry->update($id, [
        'reply_text' => trim($data['reply_text']),
        'replied_at' => date('Y-m-d H:i:s'),
        'replied_by' => $data['replied_by'] ?? 'Admin',
    ]);

    if ($success) {
        $updated = $inquiry->readOne($id);
        Response::json([
            'message' => 'Reply saved successfully.',
            'inquiry' => $updated,
        ]);
    } else {
        Response::error('Failed to save reply.', 500);
    }
} catch (Exception $e) {
    error_log("inquiries/reply error: " . $e->getMessage());
    Response::error('Failed to save reply: ' . $e->getMessage(), 500);
}
