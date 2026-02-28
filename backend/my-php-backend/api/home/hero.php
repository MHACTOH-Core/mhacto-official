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

    // Synthesize a single HeroSlide from site_settings for backward compat
    $settings = $homeContent->getHeroSettings();

    if (!$settings) {
        Response::json([]);
    } else {
        $slide = [
            'slideId'     => 1,
            'src'         => $settings['videoUrl'] ?: $settings['fallbackImage'] ?: '',
            'alt'         => $settings['title'] ?? 'Hero',
            'subtitle'    => $settings['subtitle'] ?? '',
            'title'       => $settings['title'] ?? '',
            'highlight'   => $settings['highlight'] ?? '',
            'description' => $settings['description'] ?? '',
            'href'        => $settings['ctaLink'] ?? '/destinations',
            'sortOrder'   => 1,
            'isActive'    => true,
        ];
        Response::json([$slide]);
    }
} catch (Exception $e) {
    error_log("home/hero error: " . $e->getMessage());
    Response::error('An error occurred.', 500);
}
