<?php
/**
 * GET /api/posts/read.php
 * Optional query params: ?status=published
 * Returns: array of posts
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('GET');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Post.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $post = new Post($db);

    $status = $_GET['status'] ?? null;

    $data = $status
        ? $post->readByStatus($status)
        : $post->readAll();

    Response::json($data);
} catch (Exception $e) {
    error_log("posts/read error: " . $e->getMessage());
    Response::error('Failed to fetch posts.', 500);
}
