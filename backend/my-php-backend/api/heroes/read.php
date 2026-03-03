<?php
/**
 * GET /api/heroes/read.php
 * 
 * Query params:
 *   ?slug=destinations   → returns single page hero
 *   (no slug)            → returns all page heroes
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/PageHero.php';

try {
    $db = (new Database())->getConnection();
    $model = new PageHero($db);

    $slug = $_GET['slug'] ?? null;

    if ($slug) {
        $hero = $model->readBySlug($slug);
        if (!$hero) {
            http_response_code(404);
            echo json_encode(['error' => 'Page hero not found for slug: ' . $slug]);
            exit;
        }
        echo json_encode($hero);
    } else {
        $heroes = $model->readAll();
        echo json_encode($heroes);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
