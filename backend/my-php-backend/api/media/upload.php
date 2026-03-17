<?php
/**
 * POST /api/media/upload.php
 *
 * Accepts multipart/form-data with one or more files.
 * Stores them in backend/my-php-backend/uploads/images/ or uploads/videos/
 * depending on the MIME type.
 *
 * Query params:
 *   ?type=image (default) | video
 *
 * Returns an array of uploaded file URLs.
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();

// Override Content-Type header for multipart uploads
header("Content-Type: application/json; charset=UTF-8");

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Response::error('Method not allowed. Use POST.', 405);
    }

    if (empty($_FILES['files'])) {
        Response::error('No files uploaded. Use field name "files".', 400);
    }

    $typeHint = $_GET['type'] ?? 'image';  // image | video

    $uploadsDir = __DIR__ . '/../../uploads';
    $imageDir   = $uploadsDir . '/images';
    $videoDir   = $uploadsDir . '/videos';

    if (!is_dir($imageDir)) mkdir($imageDir, 0755, true);
    if (!is_dir($videoDir)) mkdir($videoDir, 0755, true);

    $allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'];
    $allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    $allAllowed = array_merge($allowedImageTypes, $allowedVideoTypes);

    $maxImageSize = 10 * 1024 * 1024;  // 10 MB
    $maxVideoSize = 200 * 1024 * 1024; // 200 MB

    $uploaded = [];
    $errors   = [];

    // Normalise $_FILES into an array of files
    $files = normalizeFilesArray($_FILES['files']);

    foreach ($files as $i => $file) {
        // Check for upload errors
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

        $mime = mime_content_type($file['tmp_name']);
        $isVideo = in_array($mime, $allowedVideoTypes);
        $isImage = in_array($mime, $allowedImageTypes);

        if (!$isVideo && !$isImage) {
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $errors[] = "\"{$file['name']}\" — This file type (.{$ext}) is not supported. Please use JPG, PNG, GIF, WebP, or SVG for images, and MP4, WebM, or OGG for videos.";
            continue;
        }

        // Size check
        $maxSize = $isVideo ? $maxVideoSize : $maxImageSize;
        if ($file['size'] > $maxSize) {
            $maxMB = (int)($maxSize / (1024 * 1024));
            $fileMB = round($file['size'] / (1024 * 1024), 1);
            $errors[] = "\"{$file['name']}\" — This file is too large ({$fileMB} MB). The maximum allowed size is {$maxMB} MB. Try compressing or resizing it before uploading.";
            continue;
        }

        // Generate safe filename: timestamp_original-name.ext
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $baseName = pathinfo($file['name'], PATHINFO_FILENAME);
        $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName);
        $safeName = strtolower($safeName);
        $uniqueName = time() . '_' . $safeName . '.' . strtolower($ext);

        $targetDir = $isVideo ? $videoDir : $imageDir;
        $targetPath = $targetDir . '/' . $uniqueName;
        $urlPrefix  = $isVideo ? '/uploads/videos' : '/uploads/images';

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $uploaded[] = [
                'name' => $file['name'],
                'url'  => $urlPrefix . '/' . $uniqueName,
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

} catch (Exception $e) {
    error_log("media/upload error: " . $e->getMessage());
    Response::error('Upload failed: ' . $e->getMessage(), 500);
}

/**
 * Normalise the $_FILES superglobal into a flat array of files
 * whether one or multiple files are uploaded.
 */
function normalizeFilesArray(array $files): array {
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
