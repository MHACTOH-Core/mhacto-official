<?php
/**
 * ── Central Router ────────────────────────────────────────────────────
 *
 * Single entry point for all API requests. Apache mod_rewrite sends
 * every request here (see .htaccess).  Also works as a router script
 * for the PHP built-in dev server:  php -S localhost:8000 index.php
 *
 * URL format:  /api/{resource}[/{id}][?query]
 * Examples:
 *   GET    /api/posts              → list posts
 *   GET    /api/posts/42           → single post
 *   POST   /api/posts              → create post
 *   PUT    /api/posts/42           → update post
 *   DELETE /api/posts/42           → delete post
 *
 * Each resource group lives in  routes/{resource}.php  and exposes a
 * single function  handle_{resource}(string $method, ?string $id): void
 */

// ── PHP built-in server support ───────────────────────────────────────
// Serve static assets (uploads, images) directly; route /api/* through
// the router so both new routes and legacy .php files work the same way.
if (php_sapi_name() === 'cli-server') {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (strpos($uri, '/api/') !== 0 && is_file(__DIR__ . $uri)) {
        return false;
    }
}

require_once __DIR__ . '/core/Response.php';

// ── CORS (one place for the whole API) ────────────────────────────
Response::cors();
Response::preflight();

// ── Parse the request ──────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];

// Build the path relative to backend root.
// REQUEST_URI = "/api/posts/42?status=published"
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip the base path if the backend is served from a sub-directory.
// For `php -S 0.0.0.0:8000` the URI already starts at /.
// For Apache behind a sub-folder, adjust $basePath accordingly.
$basePath = '';

// If running under a sub-directory (e.g. /backend/my-php-backend),
// detect it from SCRIPT_NAME and strip it from the URI.
// Skip for the built-in dev server — SCRIPT_NAME there equals the
// request URI, so dirname() would incorrectly eat the path.
if (php_sapi_name() !== 'cli-server') {
    $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
    if ($scriptDir !== '/' && $scriptDir !== '\\') {
        $basePath = $scriptDir;
    }
}

$path = $basePath ? substr($uri, strlen($basePath)) : $uri;
$path = '/' . trim($path, '/');

// ── Route matching ─────────────────────────────────────────────────
// Expected: /api/{resource}[/{action-or-id}][/{sub-id}]
$segments = explode('/', trim($path, '/'));

// segments[0] should be "api"
if (($segments[0] ?? '') !== 'api') {
    // Not an API request — could be an upload URL or something else
    Response::error('Not found.', 404);
}

$resource  = $segments[1] ?? '';
$rawParam1 = $segments[2] ?? null;  // original URL segment (may be "read.php")
$rawParam2 = $segments[3] ?? null;

// Legacy .php action names (e.g. "read.php", "update.php") in the URL
// are stripped to their base name so route handlers receive clean values.
// Generic CRUD actions (read/create/update/delete) are nulled out entirely
// so handlers fall back to HTTP method + query-string parameters instead.
$crudActions = ['read', 'create', 'update', 'delete'];

$param1 = $rawParam1;
if ($param1 !== null && str_ends_with($param1, '.php')) {
    $base = substr($param1, 0, -4);
    $param1 = in_array($base, $crudActions, true) ? null : $base;
}

$param2 = $rawParam2;
if ($param2 !== null && str_ends_with($param2, '.php')) {
    $base = substr($param2, 0, -4);
    $param2 = in_array($base, $crudActions, true) ? null : $base;
}

// ── Route table ────────────────────────────────────────────────────
$routeFile = __DIR__ . "/routes/{$resource}.php";

if ($resource && file_exists($routeFile)) {
    require_once $routeFile;

    $handler = "handle_{$resource}";

    if (function_exists($handler)) {
        $handler($method, $param1, $param2);
        exit();
    }
}

// ── Fallback: try the old file-per-action structure ─────────────
// This keeps backward compatibility while migrating.
// e.g. /api/posts/read → api/posts/read.php
if ($resource && $rawParam1 && !is_numeric($rawParam1)) {
    $legacyFile = __DIR__ . "/api/{$resource}/{$rawParam1}";
    // Append .php if not already present
    if (!str_ends_with($legacyFile, '.php')) {
        $legacyFile .= '.php';
    }
    if (file_exists($legacyFile)) {
        require $legacyFile;
        exit();
    }
}

Response::error('Endpoint not found.', 404);
