<?php
/**
 * DELETE /api/inquiries/delete.php?id=123
 * Permanently deletes an inquiry.
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('DELETE');

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

    $success = $inquiry->delete($id);
    if ($success) {
        Response::json(['message' => 'Inquiry deleted successfully.']);
    } else {
        Response::error('Failed to delete inquiry.', 500);
    }
} catch (Exception $e) {
    error_log("inquiries/delete error: " . $e->getMessage());
    Response::error('Failed to delete inquiry.', 500);
}
