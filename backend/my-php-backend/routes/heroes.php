<?php
/**
 * Route: /api/heroes
 *
 * GET /api/heroes              — list all page heroes
 * GET /api/heroes?slug=X       — single page hero
 * GET /api/heroes/{slug}       — single page hero (clean URL)
 * PUT /api/heroes/{slug}       — update page hero
 */

function handle_heroes(string $method, ?string $slug): void
{
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/PageHero.php';

    try {
        $db    = (new Database())->getConnection();
        $model = new PageHero($db);

        // Resolve slug from URL segment or query param
        $resolvedSlug = $slug ?: ($_GET['slug'] ?? null);

        switch ($method) {
            case 'GET':
                if ($resolvedSlug) {
                    $hero = $model->readBySlug($resolvedSlug);
                    if (!$hero) Response::error('Page hero not found for slug: ' . $resolvedSlug, 404);
                    Response::json($hero);
                } else {
                    Response::json($model->readAll());
                }
                break;

            case 'PUT':
            case 'POST':
            case 'PATCH':
                if (!$resolvedSlug) Response::error('Missing required slug.', 400);

                $data = json_decode(file_get_contents('php://input'), true);
                if (!$data || !is_array($data)) Response::error('Invalid or empty JSON body.', 400);

                $updated = $model->update($resolvedSlug, $data);
                if (!$updated) Response::error('Unknown page slug: ' . $resolvedSlug, 404);

                Response::json([
                    'message' => 'Page hero updated successfully.',
                    'hero'    => $updated,
                ]);
                break;

            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (Exception $e) {
        error_log("heroes error: " . $e->getMessage());
        Response::error('Heroes: ' . $e->getMessage(), 500);
    }
}
