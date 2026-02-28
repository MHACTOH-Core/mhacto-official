<?php
/**
 * DELETE /api/media/delete.php?path=/uploads/images/file.jpg
 *
 * Deletes a previously uploaded media file.
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        Response::error('Method not allowed. Use DELETE.', 405);
    }

    $path = $_GET['path'] ?? '';

    if (!$path) {
        Response::error('Missing "path" parameter.', 400);
    }

    // Security: only allow deletion from /uploads/ directory
    if (strpos($path, '/uploads/') !== 0) {
        Response::error('Invalid path. Only uploaded files can be deleted.', 403);
    }

    // Prevent directory traversal
    if (strpos($path, '..') !== false) {
        Response::error('Invalid path.', 403);
    }

    $fullPath = __DIR__ . '/../../' . ltrim($path, '/');
    $realUploadDir = realpath(__DIR__ . '/../../uploads');
    $realFilePath  = realpath($fullPath);

    // Ensure the resolved path is within the uploads directory
    if (!$realFilePath || strpos($realFilePath, $realUploadDir) !== 0) {
        Response::error('File not found or access denied.', 404);
    }

    if (!file_exists($realFilePath)) {
        Response::error('File not found.', 404);
    }

    if (unlink($realFilePath)) {
        Response::json(['message' => 'File deleted successfully.']);
    } else {
        Response::error('Failed to delete file.', 500);
    }

} catch (Exception $e) {
    error_log("media/delete error: " . $e->getMessage());
    Response::error('Delete failed.', 500);
}
