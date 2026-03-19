<?php
use App\Config\Database;
use App\Models\Post;
use App\Core\Auth;
use App\Core\Response;

/**
 * Route: /api/posts
 *
 * GET    /api/posts          — list posts (supports ?status, ?label, ?type, ?limit, ?featured, ?category, ?id)
 * GET    /api/posts/{id}     — single post
 * POST   /api/posts          — create post
 * PUT    /api/posts/{id}     — update post
 * DELETE /api/posts/{id}     — delete post
 */

function handle_posts(string $method, ?string $id): void
{

    try {
        $db = (new Database())->getConnection();
        $GLOBALS['db'] = $db;
        $post = new Post($db);

        switch ($method) {
            case 'GET':
                _posts_read($post, $id);
                break;
            case 'POST':
                Auth::requireAuth();
                _posts_create($post);
                break;
            case 'PUT':
                Auth::requireAuth();
                _posts_update($post, $id, $db);
                break;
            case 'DELETE':
                Auth::requireAuth();
                _posts_delete($post, $id);
                break;
            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (Exception $e) {
        error_log("posts error: " . $e->getMessage());
        Response::error('An internal error occurred.', 500);
    }
}

// ── GET ─────────────────────────────────────────────────────────────

function _posts_read(Post $post, ?string $id): void
{
    // Single post by URL segment: /api/posts/42
    if ($id && is_numeric($id)) {
        $result = $post->readOne((int) $id);
        if (!$result) Response::error('Post not found.', 404);
        Response::json($result);
    }

    // Single post by query param: /api/posts?id=42
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

    if ($limit && !$type) {
        $data = array_slice($data, 0, $limit);
    }

    // Pagination: when ?page= is provided, return paginated envelope
    $page = isset($_GET['page']) ? max(1, (int) $_GET['page']) : null;
    if ($page !== null) {
        $perPage = isset($_GET['per_page']) ? max(1, min((int) $_GET['per_page'], 100)) : 20;
        $total   = count($data);
        $offset  = ($page - 1) * $perPage;
        $paged   = array_slice($data, $offset, $perPage);

        Response::json([
            'items' => array_values($paged),
            'meta'  => [
                'page'     => $page,
                'perPage'  => $perPage,
                'total'    => $total,
                'lastPage' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    Response::json($data);
}

// ── POST ────────────────────────────────────────────────────────────

function _posts_create(Post $post): void
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['title'])) {
        Response::error('Title is required.', 400);
    }

    $mapped    = _posts_mapFrontendToDb($data);
    $contentId = $post->create($mapped);
    if (!$contentId) {
        Response::error('Failed to create post.', 500);
    }
    $created   = $post->readOne($contentId);

    Response::json([
        'message' => 'Post created successfully.',
        'post'    => $created,
    ], 201);
}

// ── PUT ─────────────────────────────────────────────────────────────

function _posts_update(Post $post, ?string $id, PDO $pdo): void
{
    $postId = $id ? (int) $id : (isset($_GET['id']) ? (int) $_GET['id'] : 0);
    if (!$postId) Response::error('Missing post ID.', 400);

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) Response::error('No data provided.', 400);

    $mapped = _posts_mapUpdateToDb($data, $pdo);
    $success = $post->update($postId, $mapped);
    if (!$success) {
        Response::error('Failed to update post.', 500);
    }
    $updated = $post->readOne($postId);

    Response::json([
        'message' => 'Post updated successfully.',
        'post'    => $updated,
    ]);
}

// ── DELETE ──────────────────────────────────────────────────────────

function _posts_delete(Post $post, ?string $id): void
{
    $postId = $id ? (int) $id : (isset($_GET['id']) ? (int) $_GET['id'] : 0);
    if (!$postId) Response::error('Missing post ID.', 400);

    $success = $post->delete($postId);
    if ($success) {
        Response::json(['message' => 'Post deleted successfully.']);
    } else {
        Response::error('Failed to delete post.', 500);
    }
}

// ── Helpers ─────────────────────────────────────────────────────────

function _posts_mapFrontendToDb(array $data): array
{
    $db = $data;

    if (isset($data['contentCategory'])) {
        $db['category_id'] = _posts_resolveCategoryId($data['contentCategory']);
    }
    if (isset($data['label'])) {
        $db['label_id']  = _posts_resolveLabelId($data['label']);
        $db['label_key'] = $data['label'];
    }
    if (isset($data['body']))        $db['description']    = $data['body'];
    if (isset($data['postType']))    $db['post_type']      = $data['postType'];
    if (isset($data['isFeatured']))  $db['is_featured']    = $data['isFeatured'] ? 1 : 0;
    if (isset($data['newsDate']))    $db['news_date']      = $data['newsDate'];
    if (isset($data['category']))    $db['place_category'] = $data['category'];
    if (isset($data['author']))      $db['author']         = $data['author'];

    if (isset($data['image']) && is_array($data['image']))   $db['images'] = $data['image'];
    if (isset($data['images']) && is_array($data['images'])) $db['images'] = $data['images'];

    return $db;
}

function _posts_mapUpdateToDb(array $data, PDO $pdo): array
{
    $mapped = [];

    $simple = ['title', 'status', 'location', 'hours', 'contact', 'established', 'story', 'author'];
    foreach ($simple as $key) {
        if (isset($data[$key])) $mapped[$key] = $data[$key];
    }

    if (isset($data['body']))       $mapped['description']    = $data['body'];
    if (isset($data['postType']))   $mapped['post_type']      = $data['postType'];
    if (isset($data['isFeatured'])) $mapped['is_featured']    = $data['isFeatured'] ? 1 : 0;
    if (isset($data['newsDate']))   $mapped['news_date']      = $data['newsDate'];
    if (isset($data['category']))   $mapped['place_category'] = $data['category'];

    if (isset($data['image']) && is_array($data['image']))   $mapped['images'] = $data['image'];
    if (isset($data['images']) && is_array($data['images'])) $mapped['images'] = $data['images'];

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

    if (isset($data['label'])) {
        $stmt = $pdo->prepare("SELECT category_id FROM category WHERE category_type = 'label' AND label_key = :k LIMIT 1");
        $stmt->execute([':k' => $data['label']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) $mapped['label_id'] = (int) $row['category_id'];
    }

    return $mapped;
}

function _posts_resolveCategoryId(string $key): ?int
{
    $map = [
        'history'              => 'History',
        'arts-culture'         => 'Arts & Culture',
        'tourist-destinations' => 'Tourist Destinations',
        'news'                 => 'News',
        'events'               => 'Events',
    ];
    $name = $map[$key] ?? null;
    if (!$name) return null;

    $stmt = $GLOBALS['db']->prepare("SELECT category_id FROM category WHERE category_type = 'category' AND label_name = :n LIMIT 1");
    $stmt->execute([':n' => $name]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? (int) $row['category_id'] : null;
}

function _posts_resolveLabelId(string $key): ?int
{
    $stmt = $GLOBALS['db']->prepare("SELECT category_id FROM category WHERE category_type = 'label' AND label_key = :k LIMIT 1");
    $stmt->execute([':k' => $key]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? (int) $row['category_id'] : null;
}
