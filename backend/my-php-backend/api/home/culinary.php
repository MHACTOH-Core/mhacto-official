<?php
/**
 * GET /api/home/culinary.php
 * 
 * Culinary items are now auto-pulled from CMS content table
 * where the label_key = 'local-cuisine'.
 * 
 * No CRUD — manage culinary items via the CMS instead.
 *
 * GET params:
 *   ?limit=N  — number of items (default 4)
 *   ?all=1    — return all (admin preview)
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();

require_once __DIR__ . '/../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method !== 'GET') {
        Response::error('Culinary items are auto-pulled from CMS. Use the CMS endpoints to manage them.', 405);
    }

    $all   = isset($_GET['all']) && $_GET['all'] === '1';
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 4;

    $sql = "
        SELECT
            c.content_id, c.title, c.description,
            c.status, c.created_at,
            cat.label_name AS tag,
            (SELECT ci.image_url FROM content_images ci
             WHERE ci.content_id = c.content_id
             ORDER BY ci.is_thumbnail DESC, ci.sort_order ASC, ci.image_id ASC
             LIMIT 1) AS image
        FROM content c
        LEFT JOIN categories cat ON c.label_id = cat.category_id
        WHERE cat.label_key = 'local-cuisine'
    ";

    if (!$all) {
        $sql .= " AND c.status = 'published'";
    }

    $sql .= " ORDER BY c.created_at DESC";

    if (!$all && $limit > 0) {
        $sql .= " LIMIT " . $limit;
    }

    $stmt = $db->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $items = array_map(function ($row) {
        return [
            'itemId'      => (int) $row['content_id'],
            'title'       => $row['title'] ?? '',
            'description' => $row['description'] ?? '',
            'image'       => $row['image'] ?? '',
            'tag'         => $row['tag'] ?? 'Local Cuisine',
            'sortOrder'   => 0,
            'isActive'    => ($row['status'] ?? '') === 'published',
        ];
    }, $rows);

    Response::json($items);
} catch (Exception $e) {
    error_log("home/culinary error: " . $e->getMessage());
    Response::error('An error occurred.', 500);
}
