<?php
use App\Core\Auth;
use App\Core\Response;
/**
 * Route: /api/media
 *
 * GET    /api/media          — list uploaded files (?type=images|videos|all)
 * POST   /api/media          — upload files (multipart/form-data, field "files")
 * DELETE /api/media          — delete file (?path=/uploads/images/x.jpg)
 */

function handle_media(string $method, ?string $param1): void
{
    // All media operations require authentication with admin/content_manager role
    Auth::requireRole(['super_admin', 'admin', 'content_manager']);

    try {
        // GET /api/media/usages[?path=...]
        if ($method === 'GET' && $param1 === 'usages') {
            _media_usages();
            return;
        }

        switch ($method) {
            case 'GET':
                _media_list();
                break;
            case 'POST':
                _media_upload();
                break;
            case 'DELETE':
                _media_delete();
                break;
            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (Exception $e) {
        error_log("media error: " . $e->getMessage());
        Response::error('An internal error occurred.', 500);
    }
}

// ── GET (list) ──────────────────────────────────────────────────────

function _media_list(): void
{
    $type = $_GET['type'] ?? 'all';

    $uploadsDir = __DIR__ . '/../uploads';
    $imageDir   = $uploadsDir . '/images';
    $videoDir   = $uploadsDir . '/videos';

    if (!is_dir($imageDir)) mkdir($imageDir, 0755, true);
    if (!is_dir($videoDir)) mkdir($videoDir, 0755, true);

    $result = [];
    $imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'];
    $videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];

    if ($type === 'images' || $type === 'all') {
        $result['images'] = _media_scanDir($imageDir, '/uploads/images', $imageExts);
    }
    if ($type === 'videos' || $type === 'all') {
        $result['videos'] = _media_scanDir($videoDir, '/uploads/videos', $videoExts);
    }

    Response::json($result);
}

// ── POST (upload) ───────────────────────────────────────────────────

function _media_upload(): void
{
    // Override Content-Type for multipart uploads
    header("Content-Type: application/json; charset=UTF-8");

    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 0 && empty($_FILES['files'])) {
        $uploadLimit = ini_get('upload_max_filesize') ?: 'unknown';
        $postLimit = ini_get('post_max_size') ?: 'unknown';
        Response::error(
            "Upload exceeds server limits (upload_max_filesize={$uploadLimit}, post_max_size={$postLimit}).",
            413
        );
    }

    if (empty($_FILES['files'])) {
        Response::error('No files uploaded. Use field name "files".', 400);
    }

    $uploadsDir = __DIR__ . '/../uploads';
    $imageDir   = $uploadsDir . '/images';
    $videoDir   = $uploadsDir . '/videos';

    // Optional subfolder organization: ?category=places&label=heritage&subfolder=edited
    $category  = isset($_GET['category'])  ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['category'])  : '';
    $label     = isset($_GET['label'])     ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['label'])     : '';
    $subfolder = isset($_GET['subfolder']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['subfolder']) : '';

    if (strlen($category) > 50 || strlen($label) > 50 || strlen($subfolder) > 50) {
        Response::error('Category/label/subfolder too long (max 50 chars).', 400);
    }

    // Map CMS label keys to upload folder names where they differ
    $labelFolderMap = [
        'crafts-artisan' => 'art-wonders',
        'local-cuisine'  => 'culinary-wonders',
    ];
    if ($label && isset($labelFolderMap[$label])) {
        $label = $labelFolderMap[$label];
    }

    if (!is_dir($imageDir)) mkdir($imageDir, 0755, true);
    if (!is_dir($videoDir)) mkdir($videoDir, 0755, true);

    $allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    $allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];

    $maxImageSize = 10 * 1024 * 1024;   // 10 MB
    $maxVideoSize = 200 * 1024 * 1024;  // 200 MB

    $uploaded = [];
    $errors   = [];
    $files    = _media_normalizeFiles($_FILES['files']);

    foreach ($files as $file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $reason = match ($file['error']) {
                UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE
                    => 'The file is too large. Images must be under 10 MB and videos under 200 MB.',
                UPLOAD_ERR_PARTIAL
                    => 'The upload was interrupted. Please check your connection and try again.',
                UPLOAD_ERR_NO_FILE
                    => 'No file was selected. Please choose a file and try again.',
                UPLOAD_ERR_NO_TMP_DIR, UPLOAD_ERR_CANT_WRITE
                    => 'Server storage issue. Please contact the administrator.',
                default
                    => 'An unexpected error occurred. Please try again.',
            };
            $errors[] = "\"{$file['name']}\" — {$reason}";
            continue;
        }

        $mime    = mime_content_type($file['tmp_name']);
        $isVideo = in_array($mime, $allowedVideoTypes);
        $isImage = in_array($mime, $allowedImageTypes);

        if (!$isVideo && !$isImage) {
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $errors[] = "\"{$file['name']}\" — This file type (.{$ext}) is not supported. Please use JPG, PNG, GIF, WebP, or AVIF for images, and MP4, WebM, or OGG for videos.";
            continue;
        }

        $maxSize = $isVideo ? $maxVideoSize : $maxImageSize;
        if ($file['size'] > $maxSize) {
            $maxMB = (int)($maxSize / (1024 * 1024));
            $fileMB = round($file['size'] / (1024 * 1024), 1);
            $errors[] = "\"{$file['name']}\" — This file is too large ({$fileMB} MB). The maximum allowed size is {$maxMB} MB. Try compressing or resizing it before uploading.";
            continue;
        }

        // Derive the canonical extension from the detected MIME type
        // (prevents double-extension attacks like "shell.php.jpg")
        $mimeToExt = [
            'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif',
            'image/webp' => 'webp', 'image/avif' => 'avif',
            'video/mp4' => 'mp4', 'video/webm' => 'webm', 'video/ogg' => 'ogg',
            'video/quicktime' => 'mov', 'video/x-msvideo' => 'avi',
        ];
        $ext       = $mimeToExt[$mime] ?? pathinfo($file['name'], PATHINFO_EXTENSION);
        $baseName  = pathinfo($file['name'], PATHINFO_FILENAME);
        $safeName  = strtolower(preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName));
        $unique    = time() . '_' . $safeName . '.' . strtolower($ext);
        $baseDir   = $isVideo ? $videoDir : $imageDir;
        $baseUrl   = $isVideo ? '/uploads/videos' : '/uploads/images';

        // Build subfolder path from category/label/subfolder
        $subPath = '';
        if ($category)  $subPath .= '/' . $category;
        if ($label)     $subPath .= '/' . $label;
        if ($subfolder) $subPath .= '/' . $subfolder;

        $targetDir = $baseDir . $subPath;
        $urlPrefix = $baseUrl . $subPath;

        if (!is_dir($targetDir)) mkdir($targetDir, 0755, true);

        if (move_uploaded_file($file['tmp_name'], $targetDir . '/' . $unique)) {
            $uploaded[] = [
                'name' => $file['name'],
                'url'  => $urlPrefix . '/' . $unique,
                'size' => $file['size'],
                'type' => $isVideo ? 'video' : 'image',
            ];
        } else {
            $errors[] = "\"{$file['name']}\" — Could not save the file. Please try again or contact the administrator.";
        }
    }

    Response::json([
        'uploaded' => $uploaded,
        'errors'   => $errors,
        'count'    => count($uploaded),
    ]);
}

// ── DELETE ──────────────────────────────────────────────────────────

function _media_delete(): void
{
    $path = $_GET['path'] ?? '';

    if (!$path) Response::error('Missing "path" parameter.', 400);
    if (strpos($path, '/uploads/') !== 0) Response::error('Invalid path. Only uploaded files can be deleted.', 403);
    if (strpos($path, '..') !== false) Response::error('Invalid path.', 403);

    $fullPath      = __DIR__ . '/../' . ltrim($path, '/');
    $realUploadDir = realpath(__DIR__ . '/../uploads');
    $realFilePath  = realpath($fullPath);

    if (!$realFilePath || !str_starts_with($realFilePath, $realUploadDir . DIRECTORY_SEPARATOR)) {
        Response::error('File not found or access denied.', 404);
    }

    if (unlink($realFilePath)) {
        Response::json(['message' => 'File deleted successfully.']);
    } else {
        Response::error('Failed to delete file.', 500);
    }
}

// ── USAGES ──────────────────────────────────────────────────────────
// GET /api/media/usages          → map of { url → usage[] } for ALL referenced images
// GET /api/media/usages?path=... → usage[] for a single image path

function _media_usages(): void
{
    require_once __DIR__ . '/../config/Database.php';
    $db = (new \App\Config\Database())->connect();

    $path = isset($_GET['path']) && $_GET['path'] !== '' ? $_GET['path'] : null;

    if ($path !== null) {
        // Single-image lookup
        if (strpos($path, '/uploads/') !== 0 || strpos($path, '..') !== false) {
            Response::error('Invalid path.', 400);
        }
        $usages = _media_find_usages($db, $path);
        Response::json(['path' => $path, 'usages' => $usages, 'count' => count($usages)]);
    } else {
        // Bulk lookup — returns { usageMap: { url -> usage[] } }
        Response::json(['usageMap' => _media_find_all_usages($db)]);
    }
}

/**
 * Return all DB references to a single file URL.
 * Checks: content_images (CMS posts) and config (settings / hero images).
 */
function _media_find_usages(\PDO $db, string $path): array
{
    $usages = [];

    // 1. CMS content images
    $stmt = $db->prepare(
        "SELECT ci.image_url, c.content_id, c.title, c.post_type, c.status
         FROM content_images ci
         JOIN content c ON c.content_id = ci.content_id
         WHERE ci.image_url = ?"
    );
    $stmt->execute([$path]);
    foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
        $usages[] = [
            'type'       => 'content',
            'content_id' => (int)$row['content_id'],
            'title'      => $row['title'],
            'post_type'  => $row['post_type'],
            'status'     => $row['status'],
        ];
    }

    // 2. Config / settings (hero images, logos, etc.) — LIKE search in JSON values
    $stmt = $db->prepare(
        "SELECT config_key, config_group, config_value
         FROM config
         WHERE config_value LIKE ?"
    );
    $stmt->execute(['%' . $path . '%']);
    foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
        $label = ucwords(str_replace(['_', '-'], ' ', $row['config_key']));
        $usages[] = [
            'type'         => 'config',
            'config_key'   => $row['config_key'],
            'config_group' => $row['config_group'],
            'label'        => $label . ' (Settings)',
        ];
    }

    return $usages;
}

/**
 * Bulk version: returns a map of url → usage[] for every image currently
 * referenced in the database. Used by the media picker to badge all in-use images.
 */
function _media_find_all_usages(\PDO $db): array
{
    $map = [];

    // CMS content_images
    $stmt = $db->query(
        "SELECT ci.image_url, c.content_id, c.title, c.post_type, c.status
         FROM content_images ci
         JOIN content c ON c.content_id = ci.content_id"
    );
    foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
        $url = $row['image_url'];
        if (!$url) continue;
        if (!isset($map[$url])) $map[$url] = [];
        $map[$url][] = [
            'type'       => 'content',
            'content_id' => (int)$row['content_id'],
            'title'      => $row['title'],
            'post_type'  => $row['post_type'],
            'status'     => $row['status'],
        ];
    }

    // Config / settings
    $stmt = $db->query(
        "SELECT config_key, config_group, config_value FROM config WHERE config_value LIKE '%/uploads/%'"
    );
    foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
        if (preg_match_all('#/uploads/[^\s"\'\\\\,]+#', $row['config_value'], $matches)) {
            foreach ($matches[0] as $url) {
                $url   = rtrim($url, ".,;");
                $label = ucwords(str_replace(['_', '-'], ' ', $row['config_key']));
                if (!isset($map[$url])) $map[$url] = [];
                // Deduplicate config entries per URL
                $alreadyAdded = false;
                foreach ($map[$url] as $existing) {
                    if (($existing['config_key'] ?? null) === $row['config_key']) { $alreadyAdded = true; break; }
                }
                if (!$alreadyAdded) {
                    $map[$url][] = [
                        'type'         => 'config',
                        'config_key'   => $row['config_key'],
                        'config_group' => $row['config_group'],
                        'label'        => $label . ' (Settings)',
                    ];
                }
            }
        }
    }

    return $map;
}

// ── Helpers ─────────────────────────────────────────────────────────

function _media_scanDir(string $dir, string $urlPrefix, array $extensions): array
{
    $files = [];
    if (!is_dir($dir)) return $files;

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    $videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];

    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $ext = strtolower($file->getExtension());
            if (in_array($ext, $extensions)) {
                $relativePath = str_replace($dir, '', $file->getPathname());
                $relativePath = str_replace('\\', '/', $relativePath);
                $files[] = [
                    'name'      => $file->getFilename(),
                    'url'       => $urlPrefix . $relativePath,
                    'size'      => $file->getSize(),
                    'modified'  => date('Y-m-d H:i:s', $file->getMTime()),
                    'extension' => $ext,
                    'type'      => in_array($ext, $videoExts) ? 'video' : 'image',
                ];
            }
        }
    }

    usort($files, fn($a, $b) => strcmp($b['modified'], $a['modified']));
    return $files;
}

function _media_normalizeFiles(array $files): array
{
    $result = [];
    if (is_array($files['name'])) {
        for ($i = 0; $i < count($files['name']); $i++) {
            $result[] = [
                'name'     => $files['name'][$i],
                'type'     => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error'    => $files['error'][$i],
                'size'     => $files['size'][$i],
            ];
        }
    } else {
        $result[] = $files;
    }
    return $result;
}
