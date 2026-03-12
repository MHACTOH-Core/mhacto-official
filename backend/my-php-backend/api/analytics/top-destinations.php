<?php
/**
 * GET /api/analytics/top-destinations.php
 *
 * Admin dashboard endpoint.
 * Returns the top 10 most-clicked destinations by JOINing
 * `page_views` → `content` → `category`.
 *
 * Optional query param:
 *   ?limit=10   (default 10, max 50)
 *
 * Response:
 *   200  [ { content_id, destination_name, category, total_clicks }, … ]
 *   500  { "message": "…" }
 */

require_once __DIR__ . '/../../core/Response.php';

// 1. Standard CORS + pre-flight handling
Response::cors();
Response::preflight();

// 2. Only accept GET requests
Response::requireMethod('GET');

// 3. Parse optional limit (clamped to 1–50 to stay lightweight)
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
$limit = max(1, min($limit, 50));

// 4. Connect and delegate to the PageView model
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/PageView.php';

try {
    $database  = new Database();
    $db        = $database->getConnection();
    $pageView  = new PageView($db);

    $topDestinations = $pageView->getTopDestinations($limit);

    Response::json($topDestinations);
} catch (Exception $e) {
    error_log("analytics/top-destinations error: " . $e->getMessage());
    Response::error('Failed to fetch top destinations.', 500);
}
