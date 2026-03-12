<?php
/**
 * GET /api/home/hero.php
 * 
 * Hero is now a single video section stored in site_settings.
 * This endpoint synthesizes a HeroSlide[] array from getHeroSettings()
 * for backward compatibility with the tourist-site frontend.
 *
 * For admin CRUD, use hero-settings.php instead.
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/HomeContent.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $homeContent = new HomeContent($db);

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method !== 'GET') {
        Response::error('Hero slides are deprecated. Use /api/home/hero-settings.php to manage the hero section.', 405);
    }

    // Synthesize HeroSlide[] from hero settings – one slide per title/highlight pair
    $settings = $homeContent->getHeroSettings();

    if (!$settings) {
        Response::json([]);
    } else {
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
} catch (Exception $e) {
    error_log("home/hero error: " . $e->getMessage());
    Response::error('home/hero: ' . $e->getMessage(), 500);
}
