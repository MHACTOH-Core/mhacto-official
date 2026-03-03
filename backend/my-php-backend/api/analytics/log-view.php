<?php
/**
 * POST /api/analytics/log-view.php
 *
 * Called by the React frontend when a visitor clicks on (or navigates to)
 * a destination page.  Inserts one row into the `page_views` table.
 *
 * Expected JSON body:
 *   {
 *     "contentId":  123,           // required — the destination's content_id
 *     "sessionId":  "abc-xyz-456"  // optional — client-generated session token
 *   }
 *
 * Returns:
 *   201  { "message": "View logged." }
 *   400  { "message": "..." }       — missing / invalid contentId
 *   500  { "message": "..." }       — server error
 */

require_once __DIR__ . '/../../core/Response.php';

// 1. Standard CORS + pre-flight handling
Response::cors();
Response::preflight();

// 2. Only accept POST requests
Response::requireMethod('POST');

// 3. Parse JSON body from the React frontend
$input = Response::getJsonInput();

// 4. Validate that contentId is present and numeric
if (!$input || empty($input->contentId) || !is_numeric($input->contentId)) {
    Response::error('Missing or invalid "contentId". Must be a positive integer.', 400);
}

$contentId = (int) $input->contentId;
$sessionId = isset($input->sessionId) ? trim((string) $input->sessionId) : null;

// 5. Connect and delegate to the PageView model
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/PageView.php';

try {
    $database  = new Database();
    $db        = $database->getConnection();
    $pageView  = new PageView($db);

    $pageView->logView($contentId, $sessionId);

    Response::json(['message' => 'View logged.'], 201);
} catch (Exception $e) {
    error_log("analytics/log-view error: " . $e->getMessage());
    Response::error('Failed to log page view.', 500);
}
