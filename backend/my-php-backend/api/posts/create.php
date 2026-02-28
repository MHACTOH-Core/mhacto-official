<?php
/**
 * POST /api/posts/create.php
 * Body: { title, body, contentCategory, label, postType, status, images[], ... }
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('POST');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Post.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $GLOBALS['db'] = $db;
    $post = new Post($db);

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['title'])) {
        Response::error('Title is required.', 400);
    }

    // Map frontend camelCase keys to model/DB keys
    $mapped = mapFrontendToDb($data);

    $contentId = $post->create($mapped);

    // Return the created post
    $created = $post->readOne($contentId);

    Response::json([
        'message' => 'Post created successfully.',
        'post'    => $created,
    ], 201);
} catch (Exception $e) {
    error_log("posts/create error: " . $e->getMessage());
    Response::error('Failed to create post.', 500);
}

/**
 * Map frontend field names to DB/model field names.
 */
function mapFrontendToDb(array $data): array {
    $db = $data; // start with everything

    // Resolve category_id from contentCategory string
    if (isset($data['contentCategory'])) {
        $db['category_id'] = resolveCategoryId($data['contentCategory']);
    }

    // Resolve label_id from label string
    if (isset($data['label'])) {
        $db['label_id'] = resolveLabelId($data['label']);
    }

    // body → description
    if (isset($data['body'])) {
        $db['description'] = $data['body'];
    }

    // postType → post_type
    if (isset($data['postType'])) {
        $db['post_type'] = $data['postType'];
    }

    // image/images array
    if (isset($data['image']) && is_array($data['image'])) {
        $db['images'] = $data['image'];
    }
    if (isset($data['images']) && is_array($data['images'])) {
        $db['images'] = $data['images'];
    }

    // category → place_category
    if (isset($data['category'])) {
        $db['place_category'] = $data['category'];
    }

    // isFeatured → is_featured
    if (isset($data['isFeatured'])) {
        $db['is_featured'] = $data['isFeatured'] ? 1 : 0;
    }

    // newsDate → news_date
    if (isset($data['newsDate'])) {
        $db['news_date'] = $data['newsDate'];
    }

    return $db;
}

function resolveCategoryId(string $key): ?int {
    global $db;
    $map = [
        'history'              => 'History',
        'arts-culture'         => 'Arts & Culture',
        'tourist-destinations' => 'Tourist Destinations',
        'news'                 => 'News',
        'events'               => 'Events',
    ];
    $name = $map[$key] ?? null;
    if (!$name) return null;

    $stmt = $GLOBALS['db']->prepare("SELECT category_id FROM categories WHERE cat_type = 'category' AND label_name = :n LIMIT 1");
    $stmt->execute([':n' => $name]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? (int) $row['category_id'] : null;
}

function resolveLabelId(string $key): ?int {
    $stmt = $GLOBALS['db']->prepare("SELECT category_id FROM categories WHERE cat_type = 'label' AND label_key = :k LIMIT 1");
    $stmt->execute([':k' => $key]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? (int) $row['category_id'] : null;
}
