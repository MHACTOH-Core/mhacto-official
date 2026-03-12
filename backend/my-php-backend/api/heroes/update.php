<?php
/**
 * POST /api/heroes/update.php?slug=destinations
 * PUT  /api/heroes/update.php?slug=destinations
 *
 * Updates a page hero's image, text, icon, and accent color.
 * Accepts camelCase JSON body: { imageUrl, iconName, accentColor, label, title, description }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$allowed = ['POST', 'PUT', 'PATCH'];
if (!in_array($_SERVER['REQUEST_METHOD'], $allowed)) {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$slug = $_GET['slug'] ?? null;
if (!$slug) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required query param: slug']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or empty JSON body']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/PageHero.php';

try {
    $db = (new Database())->getConnection();
    $model = new PageHero($db);

    $updated = $model->update($slug, $data);
    if (!$updated) {
        http_response_code(404);
        echo json_encode(['error' => 'Unknown page slug: ' . $slug]);
        exit;
    }

    echo json_encode([
        'message' => 'Page hero updated successfully',
        'hero'    => $updated,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
