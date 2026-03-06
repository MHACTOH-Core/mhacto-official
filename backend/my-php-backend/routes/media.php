<?php
/**
 * Route: /api/media
 *
 * GET    /api/media          — list uploaded files (?type=images|videos|all)
 * POST   /api/media          — upload files (multipart/form-data, field "files")
 * DELETE /api/media          — delete file (?path=/uploads/images/x.jpg)
 */

function handle_media(string $method, ?string $param1, ?string $param2): void
{
    try {
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
        Response::error('Media: ' . $e->getMessage(), 500);
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

    if (empty($_FILES['files'])) {
        Response::error('No files uploaded. Use field name "files".', 400);
    }

    $uploadsDir = __DIR__ . '/../uploads';
    $imageDir   = $uploadsDir . '/images';
    $videoDir   = $uploadsDir . '/videos';

    if (!is_dir($imageDir)) mkdir($imageDir, 0755, true);
    if (!is_dir($videoDir)) mkdir($videoDir, 0755, true);

    $allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'];
    $allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];

    $maxImageSize = 10 * 1024 * 1024;   // 10 MB
    $maxVideoSize = 200 * 1024 * 1024;  // 200 MB

    $uploaded = [];
    $errors   = [];
    $files    = _media_normalizeFiles($_FILES['files']);

    foreach ($files as $file) {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = "File {$file['name']}: upload error code {$file['error']}";
            continue;
        }

        $mime    = mime_content_type($file['tmp_name']);
        $isVideo = in_array($mime, $allowedVideoTypes);
        $isImage = in_array($mime, $allowedImageTypes);

        if (!$isVideo && !$isImage) {
            $errors[] = "File {$file['name']}: unsupported file type ({$mime})";
            continue;
        }

        $maxSize = $isVideo ? $maxVideoSize : $maxImageSize;
        if ($file['size'] > $maxSize) {
            $maxMB = $maxSize / (1024 * 1024);
            $errors[] = "File {$file['name']}: exceeds {$maxMB}MB limit";
            continue;
        }

        $ext       = pathinfo($file['name'], PATHINFO_EXTENSION);
        $baseName  = pathinfo($file['name'], PATHINFO_FILENAME);
        $safeName  = strtolower(preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName));
        $unique    = time() . '_' . $safeName . '.' . strtolower($ext);
        $targetDir = $isVideo ? $videoDir : $imageDir;
        $urlPrefix = $isVideo ? '/uploads/videos' : '/uploads/images';

        if (move_uploaded_file($file['tmp_name'], $targetDir . '/' . $unique)) {
            $uploaded[] = [
                'name' => $file['name'],
                'url'  => $urlPrefix . '/' . $unique,
                'size' => $file['size'],
                'type' => $isVideo ? 'video' : 'image',
            ];
        } else {
            $errors[] = "File {$file['name']}: failed to move uploaded file";
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

    if (!$realFilePath || strpos($realFilePath, $realUploadDir) !== 0) {
        Response::error('File not found or access denied.', 404);
    }

    if (!file_exists($realFilePath)) Response::error('File not found.', 404);

    if (unlink($realFilePath)) {
        Response::json(['message' => 'File deleted successfully.']);
    } else {
        Response::error('Failed to delete file.', 500);
    }
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
