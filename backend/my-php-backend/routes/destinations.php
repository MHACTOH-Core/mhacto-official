<?php
use App\Config\Database;
use App\Models\Post;
use App\Core\Response;

/**
 * Route: /api/destinations
 *
 * GET /api/destinations — list published destinations (delegates to Post model).
 * POST — deprecated; use POST /api/posts instead.
 */

function handle_destinations(string $method, ?string $id): void
{
    try {
        if ($method === 'GET') {
            $db   = (new Database())->getConnection();
            $post = new Post($db);
            Response::json($post->readPublishedPlaces());
            return;
        }

        if ($method === 'POST') {
            Response::error('This endpoint is deprecated. Use POST /api/posts to create content.', 410);
        }

        Response::error('Method not allowed.', 405);
    } catch (Exception $e) {
        error_log("destinations error: " . $e->getMessage());
        Response::error('An internal error occurred.', 500);
    }
}
