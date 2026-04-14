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

// ── Load Composer autoloader + environment variables ──────────────
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

use App\Core\Response;
use App\Core\Auth;

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
// Supported:  /api/v1/{resource}[/{param}][/{sub}]
//             /api/{resource}[/{param}][/{sub}]     (backward compat)
$segments = explode('/', trim($path, '/'));

// segments[0] should be "api"
if (($segments[0] ?? '') !== 'api') {
    Response::error('Not found.', 404);
}

// Accept /api/v1/... — strip version segment so the rest of the router
// always works with [resource, param1, param2].
$offset = 1;
if (($segments[1] ?? '') === 'v1') {
    $offset = 2;
}

$resource  = $segments[$offset] ?? '';
$rawParam1 = $segments[$offset + 1] ?? null;
$rawParam2 = $segments[$offset + 2] ?? null;

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
        // ── Auth middleware ───────────────────────────────────────
        // Public-read resources allow unauthenticated GET requests.
        // Everything else (POST/PUT/PATCH/DELETE on any resource, and
        // all requests to admin-only resources) requires a valid JWT.
        //
        // Special cases:
        //  - /api/auth/*           → handles its own auth (login, me)
        //  - POST /api/inquiries   → public tourist contact form (no id)
        //  - POST /api/analytics/* → public page-view logging
        $publicReadResources = ['posts', 'heroes', 'home', 'destinations', 'analytics', 'settings', 'office', 'search', 'tour_guides'];
        $isPublicRead = ($method === 'GET' && in_array($resource, $publicReadResources, true));
        $isAuthRoute  = ($resource === 'auth');
        $isPublicInquiryCreate = ($resource === 'inquiries' && $method === 'POST' && !$param1);
        $isPublicAnalytics     = ($resource === 'analytics' && $method === 'POST');

        if (!$isPublicRead && !$isAuthRoute && !$isPublicInquiryCreate && !$isPublicAnalytics) {
            Auth::requireAuth(); // 401 if invalid — halts execution
        }

        $handler($method, $param1, $param2);
        exit();
    }
}

Response::error('Endpoint not found.', 404);
