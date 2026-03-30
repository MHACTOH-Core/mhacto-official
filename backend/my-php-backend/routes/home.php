<?php
use App\Config\Database;
use App\Models\HomeContent;
use App\Models\Post;
use App\Core\Auth;
use App\Core\Response;
/**
 * Route: /api/home
 *
 * Sub-resources via param1:
 *   /api/home/hero            GET            — synthesised HeroSlide[] (public)
 *   /api/home/hero-settings   GET / PUT      — hero settings CRUD
 *   /api/home/spotlight       GET / POST / PUT / DELETE
 *   /api/home/landmarks       GET / POST / PUT / DELETE / PATCH
 *   /api/home/milestones      GET / POST / PUT / PATCH / DELETE
 *   /api/home/timeline-posts  GET            — published CMS timeline posts (for milestone picker)
 *   /api/home/culinary        GET            — auto-pulled from CMS
 *   /api/home/restaurants     GET            — featured restaurants (Arts & Culture)
 *   /api/home/featured        GET            — all featured content grouped by section
 */

function handle_home(string $method, ?string $sub): void
{
    // Write operations on home content require admin/content_manager role
    if ($method !== 'GET') {
        Auth::requireRole(['super_admin', 'admin', 'content_manager']);
    }

    try {
        $db = (new Database())->getConnection();

        switch ($sub) {
            case 'hero':
                _home_hero($method, $db);
                break;
            case 'hero-settings':
                _home_heroSettings($method, $db);
                break;
            case 'spotlight':
                _home_spotlight($method, $db);
                break;
            case 'landmarks':
                _home_landmarks($method, $db);
                break;
            case 'milestones':
                _home_milestones($method, $db);
                break;
            case 'timeline-posts':
                _home_timelinePosts($method, $db);
                break;
            case 'culinary':
                _home_culinary($method, $db);
                break;
            case 'restaurants':
                _home_restaurants($method, $db);
                break;
            case 'featured':
                _home_featured($method, $db);
                break;
            default:
                Response::error('Unknown home sub-resource.', 404);
        }
    } catch (Exception $e) {
        error_log("home/{$sub} error: " . $e->getMessage());
        $isDev = ($_ENV['APP_ENV'] ?? 'development') !== 'production';
        $msg = $isDev
            ? "home/{$sub}: " . $e->getMessage()
            : 'An internal error occurred.';
        Response::error($msg, 500);
    }
}

// ── /api/home/hero ──────────────────────────────────────────────────

function _home_hero(string $method, PDO $db): void
{
    if ($method !== 'GET') {
        Response::error('Hero slides are read-only. Use /api/home/hero-settings to manage.', 405);
    }

    $homeContent = new HomeContent($db);
    $settings = $homeContent->getHeroSettings();

    if (!$settings) {
        Response::json([]);
        return;
    }

    $titles = $settings['titles'] ?? [['title' => '', 'highlight' => '']];
    $slides = [];
    foreach ($titles as $idx => $pair) {
        $slides[] = [
            'slideId'     => $idx + 1,
            'src'         => $settings['videoUrl'] ?: $settings['fallbackImage'] ?: '',
            'alt'         => $pair['title'] ?: 'Hero',
            'subtitle'    => $settings['subtitle'] ?? '',
            'title'       => $pair['title'] ?? '',
            'highlight'   => $pair['highlight'] ?? '',
            'description' => $settings['description'] ?? '',
            'href'        => $settings['ctaLink'] ?? '/destinations',
            'sortOrder'   => $idx + 1,
            'isActive'    => true,
        ];
    }
    Response::json($slides);
}

// ── /api/home/hero-settings ─────────────────────────────────────────

function _home_heroSettings(string $method, PDO $db): void
{
    $homeContent = new HomeContent($db);

    switch ($method) {
        case 'GET':
            Response::json($homeContent->getHeroSettings());
            break;
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) Response::error('No data provided.', 400);
            $success = $homeContent->updateHeroSettings($data);
            if ($success) {
                Response::json(['message' => 'Hero settings updated successfully.']);
            } else {
                Response::error('Failed to update hero settings.', 500);
            }
            break;
        default:
            Response::error('Method not allowed.', 405);
    }
}

// ── /api/home/spotlight ─────────────────────────────────────────────

function _home_spotlight(string $method, PDO $db): void
{
    $homeContent = new HomeContent($db);

    switch ($method) {
        case 'GET':
            $all = isset($_GET['all']) && $_GET['all'] === '1';
            Response::json($homeContent->getSpotlight($all));
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || empty($data['contentId'])) Response::error('Content ID is required.', 400);
            $featuredId = $homeContent->createSpotlight($data);
            Response::json(['message' => 'Spotlight created successfully.', 'featuredId' => (int) $featuredId], 201);
            break;

        case 'PUT':
            $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
            if (!$id) Response::error('Spotlight ID is required.', 400);
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) Response::error('No data provided.', 400);
            $success = $homeContent->updateSpotlight($id, $data);
            $success ? Response::json(['message' => 'Spotlight updated successfully.'])
                     : Response::error('Failed to update spotlight.', 500);
            break;

        case 'DELETE':
            $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
            if (!$id) Response::error('Spotlight ID is required.', 400);
            $success = $homeContent->deleteSpotlight($id);
            $success ? Response::json(['message' => 'Spotlight deleted successfully.'])
                     : Response::error('Failed to delete spotlight.', 500);
            break;

        default:
            Response::error('Method not allowed.', 405);
    }
}

// ── /api/home/landmarks ─────────────────────────────────────────────

function _home_landmarks(string $method, PDO $db): void
{
    $homeContent = new HomeContent($db);

    switch ($method) {
        case 'GET':
            $all = isset($_GET['all']) && $_GET['all'] === '1';
            Response::json($homeContent->getFeaturedLandmarks($all));
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || empty($data['contentId'])) Response::error('Content ID is required.', 400);
            $featuredId = $homeContent->createFeaturedLandmark($data);
            Response::json(['message' => 'Featured landmark created successfully.', 'featuredId' => (int) $featuredId], 201);
            break;

        case 'PUT':
            $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
            if (!$id) Response::error('Landmark ID is required.', 400);
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) Response::error('No data provided.', 400);
            $success = $homeContent->updateFeaturedLandmark($id, $data);
            $success ? Response::json(['message' => 'Featured landmark updated successfully.'])
                     : Response::error('Failed to update featured landmark.', 500);
            break;

        case 'DELETE':
            $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
            if (!$id) Response::error('Landmark ID is required.', 400);
            $success = $homeContent->deleteFeaturedLandmark($id);
            $success ? Response::json(['message' => 'Featured landmark deleted successfully.'])
                     : Response::error('Failed to delete featured landmark.', 500);
            break;

        case 'PATCH':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || empty($data['order'])) Response::error('Reorder array is required.', 400);
            $success = $homeContent->reorderFeaturedLandmarks($data['order']);
            $success ? Response::json(['message' => 'Landmarks reordered successfully.'])
                     : Response::error('Failed to reorder landmarks.', 500);
            break;

        default:
            Response::error('Method not allowed.', 405);
    }
}

// ── /api/home/milestones ────────────────────────────────────────────

function _home_milestones(string $method, PDO $db): void
{
    $homeContent = new HomeContent($db);

    switch ($method) {
        case 'GET':
            $all = isset($_GET['all']) && $_GET['all'] === '1';
            Response::json($homeContent->getMilestones($all));
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || (empty($data['contentId']) && (empty($data['title']) || empty($data['year'])))) {
                Response::error('Either contentId or title+year is required.', 400);
            }
            $milestoneId = $homeContent->createMilestone($data);
            if (is_array($milestoneId) && isset($milestoneId['error'])) {
                Response::error($milestoneId['message'], 409);
            }
            Response::json(['message' => 'Milestone created successfully.', 'milestoneId' => (int) $milestoneId], 201);
            break;

        case 'PUT':
            $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
            if (!$id) Response::error('Milestone ID is required.', 400);
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) Response::error('No data provided.', 400);
            $success = $homeContent->updateMilestone($id, $data);
            $success ? Response::json(['message' => 'Milestone updated successfully.'])
                     : Response::error('Failed to update milestone.', 500);
            break;

        case 'PATCH':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || !isset($data['order']) || !is_array($data['order'])) {
                Response::error('Order array is required.', 400);
            }
            $success = $homeContent->reorderMilestones($data['order']);
            $success ? Response::json(['message' => 'Milestones reordered successfully.'])
                     : Response::error('Failed to reorder milestones.', 500);
            break;

        case 'DELETE':
            $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
            if (!$id) Response::error('Milestone ID is required.', 400);
            $success = $homeContent->deleteMilestone($id);
            $success ? Response::json(['message' => 'Milestone deleted successfully.'])
                     : Response::error('Failed to delete milestone.', 500);
            break;

        default:
            Response::error('Method not allowed.', 405);
    }
}

// ── /api/home/timeline-posts ────────────────────────────────────────
// Returns published CMS posts with label 'timeline-of-events' for the
// admin milestone picker dropdown.

function _home_timelinePosts(string $method, PDO $db): void
{
    if ($method !== 'GET') {
        Response::error('Method not allowed.', 405);
    }

    require_once __DIR__ . '/../models/Post.php';
    $post = new Post($db);
    $posts = $post->readByLabel('timeline-of-events', 'published');
    Response::json($posts);
}

// ── /api/home/culinary ──────────────────────────────────────────────

function _home_culinary(string $method, PDO $db): void
{
    if ($method !== 'GET') {
        Response::error('Culinary items are auto-pulled from CMS. Use the CMS endpoints.', 405);
    }

    $all   = isset($_GET['all']) && $_GET['all'] === '1';
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 4;

    $sql = "
        SELECT
            c.content_id, c.title, c.description,
            c.status, c.created_at,
            COALESCE(lbl.label_name, 'Culinary Wonders') AS tag,
            (SELECT ci.image_url FROM content_images ci
             WHERE ci.content_id = c.content_id
             ORDER BY ci.is_thumbnail DESC, ci.sort_order ASC, ci.image_id ASC
             LIMIT 1) AS image
        FROM content c
        INNER JOIN content_fields cm ON c.content_id = cm.content_id
            AND cm.meta_key = 'label_key' AND cm.meta_value = 'local-cuisine'
        LEFT JOIN content_fields lm ON c.content_id = lm.content_id AND lm.meta_key = 'label_id'
        LEFT JOIN category lbl ON lbl.category_id = CAST(lm.meta_value AS UNSIGNED)
    ";

    if (!$all) $sql .= " WHERE c.status = 'published'";
    $sql .= " ORDER BY c.created_at DESC";
    if (!$all && $limit > 0) $sql .= " LIMIT " . $limit;

    $stmt = $db->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $items = array_map(fn($row) => [
        'itemId'      => (int) $row['content_id'],
        'title'       => $row['title'] ?? '',
        'description' => $row['description'] ?? '',
        'image'       => $row['image'] ?? '',
        'tag'         => $row['tag'] ?? 'Culinary Wonders',
        'sortOrder'   => 0,
        'isActive'    => ($row['status'] ?? '') === 'published',
    ], $rows);

    Response::json($items);
}

// ── /api/home/restaurants ────────────────────────────────────────────

function _home_restaurants(string $method, PDO $db): void
{
    if ($method !== 'GET') {
        Response::error('Restaurants are auto-pulled from CMS. Use the CMS endpoints.', 405);
    }

    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 6;

    $sql = "
        SELECT
            c.content_id, c.title, c.description,
            c.status, c.created_at,
            COALESCE(lbl.label_name, 'Restaurants & Eateries') AS tag,
            (SELECT ci.image_url FROM content_images ci
             WHERE ci.content_id = c.content_id
             ORDER BY ci.is_thumbnail DESC, ci.sort_order ASC, ci.image_id ASC
             LIMIT 1) AS image
        FROM content c
        INNER JOIN content_fields cm ON c.content_id = cm.content_id
            AND cm.meta_key = 'label_key' AND cm.meta_value = 'restaurants'
        INNER JOIN content_fields feat ON c.content_id = feat.content_id
            AND feat.meta_key = 'is_featured' AND feat.meta_value = '1'
        LEFT JOIN content_fields lm ON c.content_id = lm.content_id AND lm.meta_key = 'label_id'
        LEFT JOIN category lbl ON lbl.category_id = CAST(lm.meta_value AS UNSIGNED)
        WHERE c.status = 'published'
        ORDER BY c.created_at DESC
    ";
    if ($limit > 0) $sql .= " LIMIT " . $limit;

    $stmt = $db->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $items = array_map(fn($row) => [
        'itemId'      => (int) $row['content_id'],
        'title'       => $row['title'] ?? '',
        'description' => $row['description'] ?? '',
        'image'       => $row['image'] ?? '',
        'tag'         => $row['tag'] ?? 'Restaurants & Eateries',
        'sortOrder'   => 0,
        'isActive'    => ($row['status'] ?? '') === 'published',
    ], $rows);

    Response::json($items);
}

// ── /api/home/featured ──────────────────────────────────────────────
//
// Returns all published posts marked as is_featured='1', grouped by section.
//
// GET /api/home/featured              — full grouped response
// GET /api/home/featured?section=news — single section only
// GET /api/home/featured?limit=4      — limit per group (default: no limit)

function _home_featured(string $method, PDO $db): void
{
    if ($method !== 'GET') {
        Response::error('Method not allowed.', 405);
    }

    $post = new Post($db);

    $section = $_GET['section'] ?? null;
    $limit   = isset($_GET['limit']) ? (int) $_GET['limit'] : null;

    // Label groups for arts & culture section
    $artsCultureLabels = [
        'localCuisine'      => 'local-cuisine',
        'restaurants'       => 'restaurants',
        'festivals'         => 'festivals',
        'culturalPractices' => 'cultural-practices',
        'craftsArtisan'     => 'crafts-artisan',
        'peopleWonders'     => 'people-wonders',
    ];

    // If a specific section is requested, return just that
    if ($section) {
        switch ($section) {
            case 'arts-culture':
                $result = [];
                foreach ($artsCultureLabels as $key => $label) {
                    $result[$key] = $post->readFeaturedByLabel($label, $limit);
                }
                Response::json($result);
                break;

            case 'people-wonders':
                Response::json($post->readFeaturedByLabel('people-wonders', $limit));
                break;

            case 'notable-figures':
                Response::json($post->readFeaturedByLabel('notable-figures', $limit));
                break;

            case 'news':
                Response::json($post->readFeaturedByCategory('news', $limit));
                break;

            case 'events':
                Response::json($post->readFeaturedByCategory('events', $limit));
                break;

            case 'destinations':
                Response::json($post->readFeaturedByLabel('destinations', $limit));
                break;

            case 'tourist-attractions':
                Response::json($post->readFeaturedByLabel('tourist-attractions', $limit));
                break;

            case 'community':
                Response::json($post->readFeaturedByCategory('community', $limit));
                break;

            default:
                // Try as a label key
                Response::json($post->readFeaturedByLabel($section, $limit));
        }
        return;
    }

    // Full grouped response — everything the home page needs
    $result = [
        'artsCulture' => [],
        'notableFigures' => $post->readFeaturedByLabel('notable-figures', $limit),
        'destinations'   => $post->readFeaturedByLabel('destinations', $limit),
        'touristAttractions' => $post->readFeaturedByLabel('tourist-attractions', $limit),
        'news'           => $post->readFeaturedByCategory('news', $limit),
        'events'         => $post->readFeaturedByCategory('events', $limit),
        'community'      => $post->readFeaturedByCategory('community', $limit),
    ];

    foreach ($artsCultureLabels as $key => $label) {
        $result['artsCulture'][$key] = $post->readFeaturedByLabel($label, $limit);
    }

    Response::json($result);
}
