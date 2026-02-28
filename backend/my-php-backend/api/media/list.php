<?php
/**
 * GET /api/media/list.php?type=images|videos|all
 *
 * Scans the uploads directory and returns a list of uploaded media files
 * grouped by type (images / videos).
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();

try {
    $type = $_GET['type'] ?? 'all';  // images | videos | all

    $uploadsDir = __DIR__ . '/../../uploads';

    // Create uploads directories if they don't exist
    $imageDir = $uploadsDir . '/images';
    $videoDir = $uploadsDir . '/videos';

    if (!is_dir($imageDir)) mkdir($imageDir, 0755, true);
    if (!is_dir($videoDir)) mkdir($videoDir, 0755, true);

    $result = [];

    $imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'];
    $videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];

    // Scan images
    if ($type === 'images' || $type === 'all') {
        $result['images'] = scanMediaDir($imageDir, '/uploads/images', $imageExts);
    }

    // Scan videos
    if ($type === 'videos' || $type === 'all') {
        $result['videos'] = scanMediaDir($videoDir, '/uploads/videos', $videoExts);
    }

    Response::json($result);

} catch (Exception $e) {
    error_log("media/list error: " . $e->getMessage());
    Response::error('Failed to list media files.', 500);
}

/**
 * Recursively scan a directory for media files.
 */
function scanMediaDir(string $dir, string $urlPrefix, array $extensions): array {
    $files = [];

    if (!is_dir($dir)) return $files;

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $ext = strtolower($file->getExtension());
            if (in_array($ext, $extensions)) {
                $relativePath = str_replace($dir, '', $file->getPathname());
                $relativePath = str_replace('\\', '/', $relativePath);  // Windows compat
                $files[] = [
                    'name'      => $file->getFilename(),
                    'url'       => $urlPrefix . $relativePath,
                    'size'      => $file->getSize(),
                    'modified'  => date('Y-m-d H:i:s', $file->getMTime()),
                    'extension' => $ext,
                    'type'      => in_array($ext, ['mp4', 'webm', 'ogg', 'mov', 'avi']) ? 'video' : 'image',
                ];
            }
        }
    }

    // Sort by most recent first
    usort($files, fn($a, $b) => strtotime($b['modified']) - strtotime($a['modified']));

    return $files;
}
