<?php
/**
 * GET /api/posts/read.php
 * Query params:
 *   ?status=published
 *   ?label=news          (filter by content_label.label_key)
 *   ?type=places|news    (published places or news)
 *   ?limit=4             (limit results)
 *   ?id=123              (single post)
 *   ?featured=1          (featured posts only, optionally combined with label or category)
 *   ?featured=1&label=local-cuisine  (featured for a specific label)
 *   ?featured=1&category=arts-culture (featured for a specific category)
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

    // Single post
    if (!empty($_GET['id'])) {
        $result = $post->readOne((int) $_GET['id']);
        if (!$result) Response::error('Post not found.', 404);
        Response::json($result);
    }

    $status   = $_GET['status'] ?? null;
    $label    = $_GET['label'] ?? null;
    $type     = $_GET['type'] ?? null;
    $limit    = isset($_GET['limit']) ? (int) $_GET['limit'] : null;
    $featured = !empty($_GET['featured']);
    $category = $_GET['category'] ?? null;

    // Featured posts endpoint
    if ($featured) {
        if ($label) {
            $data = $post->readFeaturedByLabel($label, $limit);
        } elseif ($category) {
            $data = $post->readFeaturedByCategory($category, $limit);
        } else {
            $data = $post->readFeaturedByLabel(null, $limit);
        }
    } elseif ($type === 'places') {
        $data = $post->readPublishedPlaces($limit);
    } elseif ($type === 'news') {
        $data = $post->readPublishedNews($limit);
    } elseif ($type === 'events') {
        $data = $post->readPublishedEvents($limit);
    } elseif ($label) {
        $data = $post->readByLabel($label, $status);
    } elseif ($category) {
        $data = $post->readByCategory($category, $status, $limit);
    } elseif ($status) {
        $data = $post->readByStatus($status);
    } else {
        $data = $post->readAll();
    }

    // Apply limit if not already applied by dedicated methods
    if ($limit && !$type) {
        $data = array_slice($data, 0, $limit);
    }

    Response::json($data);
} catch (Exception $e) {
    error_log("posts/read error: " . $e->getMessage());
    Response::error('Failed to fetch posts.', 500);
}
