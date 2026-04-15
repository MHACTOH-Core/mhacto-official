<?php
use App\Config\Database;
use App\Models\Post;
use App\Core\Auth;
use App\Core\Response;
use App\Core\QueryCache;

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
        $post = new Post($db);

        switch ($method) {
            case 'GET':
                _posts_read($post, $id);
                break;
            case 'POST':
                Auth::requireRole(['super_admin', 'admin', 'content_manager']);
                _posts_create($post, $db);
                break;
            case 'PUT':
                Auth::requireRole(['super_admin', 'admin', 'content_manager']);
                _posts_update($post, $id, $db);
                break;
            case 'DELETE':
                Auth::requireRole(['super_admin', 'admin']);
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
    // Check if user is authenticated (admin/editor) — if not, restrict to published content only
    $authedUser = Auth::optionalAuth();
    $isAuthed = $authedUser !== null;

    // Single post by URL segment: /api/posts/42
    if ($id && is_numeric($id)) {
        $result = $post->readOne((int) $id);
        if (!$result) Response::error('Post not found.', 404);
        // Public users can only see published posts
        if (!$isAuthed && ($result['status'] ?? '') !== 'published') {
            Response::error('Post not found.', 404);
        }
        // Cache individual public posts for 5 minutes
        if (!$isAuthed) QueryCache::httpCacheHeaders(300);
        Response::json($result);
    }

    // Single post by query param: /api/posts?id=42
    if (!empty($_GET['id'])) {
        $result = $post->readOne((int) $_GET['id']);
        if (!$result) Response::error('Post not found.', 404);
        if (!$isAuthed && ($result['status'] ?? '') !== 'published') {
            Response::error('Post not found.', 404);
        }
        if (!$isAuthed) QueryCache::httpCacheHeaders(300);
        Response::json($result);
    }

    // ── Public search: /api/posts?search=query ───────────────────
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    if ($search !== '') {
        if (mb_strlen($search) < 2 || mb_strlen($search) > 100) {
            Response::json([]);  // too short or too long — return empty
        }
        $searchLimit = isset($_GET['limit']) ? min((int) $_GET['limit'], 20) : 12;
        $cacheKey = 'posts_search_' . md5($search . $searchLimit);
        QueryCache::httpCacheHeaders(120); // 2-minute browser cache for search
        $results = QueryCache::remember($cacheKey, 120, fn() => $post->search($search, $searchLimit));
        Response::json($results);
    }

    $status   = $_GET['status'] ?? null;
    $label    = $_GET['label'] ?? null;
    $type     = $_GET['type'] ?? null;
    $limit    = isset($_GET['limit']) ? (int) $_GET['limit'] : null;
    $featured = !empty($_GET['featured']);
    $category = $_GET['category'] ?? null;

    // Public users can only see published content
    if (!$isAuthed && !$status) {
        $status = 'published';
    }

    // For public (unauthenticated) reads, cache results in APCu and send
    // HTTP cache headers so CDN/browser can also cache the response.
    // Admin reads (isAuthed=true) always bypass cache for fresh data.
    $cacheKey = null;
    if (!$isAuthed && $status === 'published') {
        $cacheKey = 'posts_' . md5(http_build_query($_GET));
        QueryCache::httpCacheHeaders(300); // 5-minute browser/CDN cache
    } else {
        QueryCache::noCacheHeaders();
    }

    $query = function () use ($post, $type, $label, $category, $status, $limit, $featured) {
        if ($featured) {
            if ($label)    return $post->readFeaturedByLabel($label, $limit);
            if ($category) return $post->readFeaturedByCategory($category, $limit);
            return $post->readFeaturedByLabel(null, $limit);
        }
        if ($type === 'places')  return $post->readPublishedPlaces($limit);
        if ($type === 'news')    return $post->readPublishedNews($limit);
        if ($type === 'events')  return $post->readPublishedEvents($limit);
        if ($label)              return $post->readByLabel($label, $status);
        if ($category)           return $post->readByCategory($category, $status, $limit);
        if ($status)             return $post->readByStatus($status);
        return $post->readAll();
    };

    $data = $cacheKey
        ? QueryCache::remember($cacheKey, 300, $query)
        : $query();

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

function _posts_create(Post $post, PDO $pdo): void
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['title'])) {
        Response::error('Title is required.', 400);
    }

    // Singleton labels — only one post allowed per label
    $singletonLabels = ['pagoda'];
    $label = $data['label'] ?? '';
    if (in_array($label, $singletonLabels, true)) {
        $stmt = $pdo->prepare(
            'SELECT COUNT(*) FROM content c
             JOIN content_fields cf ON c.content_id = cf.content_id
             WHERE cf.meta_key = :mk AND cf.meta_value = :lk'
        );
        $stmt->execute([':mk' => 'label_key', ':lk' => $label]);
        if ((int) $stmt->fetchColumn() > 0) {
            Response::error("Only one \"{$label}\" entry is allowed. Please update the existing one instead.", 409);
        }
    }

    $mapped    = _posts_mapFrontendToDb($data, $pdo);
    $contentId = $post->create($mapped);
    if (!$contentId) {
        Response::error('Failed to create post.', 500);
    }
    $created   = $post->readOne($contentId);

    // Invalidate public post caches so next request rebuilds fresh data
    QueryCache::forgetByPrefix('posts_');

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

    // Invalidate all public post caches so edits are visible immediately
    QueryCache::forgetByPrefix('posts_');

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
        QueryCache::forgetByPrefix('posts_');
        Response::json(['message' => 'Post deleted successfully.']);
    } else {
        Response::error('Failed to delete post.', 500);
    }
}

// ── Helpers ─────────────────────────────────────────────────────────

function _posts_mapFrontendToDb(array $data, PDO $pdo): array
{
    $db = $data;

    if (isset($data['contentCategory'])) {
        $db['category_id'] = _posts_resolveCategoryId($data['contentCategory'], $pdo);
    }
    if (isset($data['label'])) {
        $db['label_id']  = _posts_resolveLabelId($data['label'], $pdo);
        $db['label_key'] = $data['label'];
    }
    if (isset($data['body']))        $db['description']    = $data['body'];
    if (isset($data['postType']))    $db['post_type']      = $data['postType'];
    if (isset($data['label']) && $data['label'] === 'timeline-of-events') {
        $db['is_featured'] = 0;
    } elseif (isset($data['isFeatured'])) {
        $db['is_featured'] = $data['isFeatured'] ? 1 : 0;
    }
    if (isset($data['newsDate']))    $db['news_date']      = $data['newsDate'];
    if (isset($data['category']))    $db['place_category'] = $data['category'];
    if (isset($data['author']))      $db['author']         = $data['author'];
    if (isset($data['highlights']))  $db['tour_highlights'] = is_array($data['highlights']) ? json_encode($data['highlights']) : $data['highlights'];

    $images = $data['images'] ?? $data['image'] ?? null;
    if (is_array($images)) $db['images'] = $images;

    return $db;
}

function _posts_mapUpdateToDb(array $data, PDO $pdo): array
{
    $mapped = [];

    $simple = ['title', 'status', 'location', 'latitude', 'longitude', 'hours', 'contact', 'established', 'story', 'author'];
    foreach ($simple as $key) {
        if (isset($data[$key])) $mapped[$key] = $data[$key];
    }

    if (isset($data['body']))       $mapped['description']    = $data['body'];
    if (isset($data['postType']))   $mapped['post_type']      = $data['postType'];
    if (isset($data['label']) && $data['label'] === 'timeline-of-events') {
        $mapped['is_featured'] = 0;
    } elseif (isset($data['isFeatured'])) {
        $mapped['is_featured'] = $data['isFeatured'] ? 1 : 0;
    }
    if (isset($data['newsDate']))   $mapped['news_date']      = $data['newsDate'];
    if (isset($data['category']))   $mapped['place_category'] = $data['category'];
    if (isset($data['highlights'])) $mapped['tour_highlights'] = is_array($data['highlights']) ? json_encode($data['highlights']) : $data['highlights'];

    $images = $data['images'] ?? $data['image'] ?? null;
    if (is_array($images)) $mapped['images'] = $images;

    if (isset($data['contentCategory'])) {
        $name = _posts_categoryNameMap()[$data['contentCategory']] ?? null;
        if ($name) {
            $stmt = $pdo->prepare("SELECT category_id FROM categories WHERE category_type = 'category' AND label_name = :n LIMIT 1");
            $stmt->execute([':n' => $name]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) $mapped['category_id'] = (int) $row['category_id'];
        }
    }

    if (isset($data['label'])) {
        $stmt = $pdo->prepare("SELECT category_id FROM categories WHERE category_type = 'label' AND label_key = :k LIMIT 1");
        $stmt->execute([':k' => $data['label']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) $mapped['label_id'] = (int) $row['category_id'];
        $mapped['label_key'] = $data['label'];
    }

    return $mapped;
}

function _posts_categoryNameMap(): array
{
    return [
        'history'              => 'History',
        'arts-culture'         => 'Arts & Culture',
        'tourist-wonders'      => 'Tourist Destinations',
        'tourist-destinations' => 'Tourist Destinations',
        'news'                 => 'News & Events',
        'events'               => 'News & Events',
        'community'            => 'Community',
    ];
}

function _posts_resolveCategoryId(string $key, PDO $pdo): ?int
{
    $name = _posts_categoryNameMap()[$key] ?? null;
    if (!$name) return null;

    $stmt = $pdo->prepare("SELECT category_id FROM categories WHERE category_type = 'category' AND label_name = :n LIMIT 1");
    $stmt->execute([':n' => $name]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? (int) $row['category_id'] : null;
}

function _posts_resolveLabelId(string $key, PDO $pdo): ?int
{
    $stmt = $pdo->prepare("SELECT category_id FROM categories WHERE category_type = 'label' AND label_key = :k LIMIT 1");
    $stmt->execute([':k' => $key]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? (int) $row['category_id'] : null;
}
