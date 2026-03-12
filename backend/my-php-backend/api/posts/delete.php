<?php
/**
 * DELETE /api/posts/delete.php?id=123
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('DELETE');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Post.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $post = new Post($db);

    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        Response::error('Missing post ID.', 400);
    }

    $success = $post->delete($id);
    if ($success) {
        Response::json(['message' => 'Post deleted successfully.']);
    } else {
        Response::error('Failed to delete post.', 500);
    }
} catch (Exception $e) {
    error_log("posts/delete error: " . $e->getMessage());
    Response::error('Failed to delete post.', 500);
}
