<?php
/**
 * GET /api/inquiries/read.php
 * Optional query params: ?status=unread
 * Returns: array of inquiries
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('GET');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Inquiry.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $inquiry = new Inquiry($db);

    $status = $_GET['status'] ?? null;

    $data = $status
        ? $inquiry->readByStatus($status)
        : $inquiry->readAll();

    Response::json($data);
} catch (Exception $e) {
    error_log("inquiries/read error: " . $e->getMessage());
    Response::error('Failed to fetch inquiries.', 500);
}
