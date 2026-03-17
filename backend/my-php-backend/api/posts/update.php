<?php
/**
 * PUT /api/posts/update.php?id=123
 * Body: { title, body, status, images[], ... }
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('PUT');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Post.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $GLOBALS['db'] = $db;
    $post = new Post($db);

    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        Response::error('Missing post ID.', 400);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        Response::error('No data provided.', 400);
    }

    // Map frontend field names to DB/model field names
    $mapped = mapFrontendToDb($data, $db);

    $post->update($id, $mapped);

    // Return the updated post
    $updated = $post->readOne($id);

    Response::json([
        'message' => 'Post updated successfully.',
        'post'    => $updated,
    ]);
} catch (Exception $e) {
    error_log("posts/update error: " . $e->getMessage());
    Response::error('Failed to update post.', 500);
}

function mapFrontendToDb(array $data, PDO $pdo): array {
    $mapped = [];

    // Simple field mappings
    if (isset($data['title']))       $mapped['title']       = $data['title'];
    if (isset($data['status']))      $mapped['status']      = $data['status'];
    if (isset($data['location']))    $mapped['location']    = $data['location'];
    if (isset($data['hours']))       $mapped['hours']       = $data['hours'];
    if (isset($data['contact']))     $mapped['contact']     = $data['contact'];
    if (isset($data['established'])) $mapped['established'] = $data['established'];
    if (isset($data['story']))       $mapped['story']       = $data['story'];

    // body → description
    if (isset($data['body'])) $mapped['description'] = $data['body'];

    // postType → post_type
    if (isset($data['postType'])) $mapped['post_type'] = $data['postType'];

    // image/images → images
    if (isset($data['image']) && is_array($data['image'])) {
        $mapped['images'] = $data['image'];
    }
    if (isset($data['images']) && is_array($data['images'])) {
        $mapped['images'] = $data['images'];
    }

    // category → place_category
    if (isset($data['category'])) $mapped['place_category'] = $data['category'];

    // isFeatured → is_featured
    if (isset($data['isFeatured'])) $mapped['is_featured'] = $data['isFeatured'] ? 1 : 0;

    // newsDate → news_date
    if (isset($data['newsDate'])) $mapped['news_date'] = $data['newsDate'];

    // author (stored directly in content table)
    if (isset($data['author'])) $mapped['author'] = $data['author'];

    // contentCategory → category_id (lookup)
    if (isset($data['contentCategory'])) {
        $catMap = [
            'history'              => 'History',
            'arts-culture'         => 'Arts & Culture',
            'tourist-destinations' => 'Tourist Destinations',
            'news'                 => 'News',
            'events'               => 'Events',
        ];
        $name = $catMap[$data['contentCategory']] ?? null;
        if ($name) {
            $stmt = $pdo->prepare("SELECT category_id FROM category WHERE category_type = 'category' AND label_name = :n LIMIT 1");
            $stmt->execute([':n' => $name]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) $mapped['category_id'] = (int) $row['category_id'];
        }
    }

    // label → label_id (lookup)
    if (isset($data['label'])) {
        $stmt = $pdo->prepare("SELECT category_id FROM category WHERE category_type = 'label' AND label_key = :k LIMIT 1");
        $stmt->execute([':k' => $data['label']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) $mapped['label_id'] = (int) $row['category_id'];
    }

    return $mapped;
}
