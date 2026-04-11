<?php
namespace App\Core;

/**
 * Response — Standardised CORS headers and JSON responses.
 *
 * Usage (in any API endpoint):
 *   require_once __DIR__ . '/../core/Response.php';
 *   Response::cors();
 *   Response::preflight();
 *   Response::requireMethod('POST');
 *   $input = Response::getJsonInput();
 *   Response::json(['message' => 'ok']);
 */

class Response
{
    /**
     * Emit the CORS headers required by the frontend.
     * Only whitelisted origins (from ALLOWED_ORIGINS env var) are accepted.
     * In development, defaults to http://localhost:3000 if not configured.
     */
    public static function cors(): void
    {
        $allowedRaw = $_ENV['ALLOWED_ORIGINS'] ?? 'http://localhost:3000';
        $allowedOrigins = array_map('trim', explode(',', $allowedRaw));

        $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($requestOrigin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: {$requestOrigin}");
        } elseif ($requestOrigin === '' && php_sapi_name() === 'cli-server') {
            // Allow same-origin requests during local dev (no Origin header)
            header("Access-Control-Allow-Origin: http://localhost:3000");
        }
        // If origin is not whitelisted, no Access-Control-Allow-Origin header is sent,
        // causing the browser to block the request.

        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        // Private Network Access (PNA) — required by Firefox/Chrome when a page on
        // localhost makes cross-origin requests to 127.0.0.1 (a different "host").
        // Without this, Firefox throws "NetworkError when attempting to fetch resource."
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_PRIVATE_NETWORK'])
            || ($_SERVER['HTTP_ORIGIN'] ?? '') !== '') {
            header("Access-Control-Allow-Private-Network: true");
        }
        header("Content-Type: application/json; charset=UTF-8");

        // ── Security headers ─────────────────────────────────────────
        // Prevent clickjacking (embedding in iframes on other origins)
        header("X-Frame-Options: DENY");
        // Prevent MIME-type sniffing attacks
        header("X-Content-Type-Options: nosniff");
        // Disable the legacy XSS auditor (can cause false positives; CSP is better)
        header("X-XSS-Protection: 0");
        // Don't send Referer on cross-origin requests
        header("Referrer-Policy: strict-origin-when-cross-origin");
        // Restrict browser features not needed by the API
        header("Permissions-Policy: geolocation=(), camera=(), microphone=()");
    }

    /** Respond to OPTIONS pre-flight and exit. */
    public static function preflight(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header("Access-Control-Max-Age: 86400"); // cache preflight for 24h
            http_response_code(204);
            exit();
        }
    }

    /** Abort with 405 if the method doesn't match. */
    public static function requireMethod(string $method): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== strtoupper($method)) {
            self::error("Method not allowed. Use {$method}.", 405);
        }
    }

    /** Send a JSON response and exit. Wraps data in a standard envelope. */
    public static function json(mixed $data, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'data'    => $data,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    /** Shorthand error response. */
    public static function error(string $message, int $code = 400): void
    {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error'   => $message,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    /** Decode the raw JSON body. */
    public static function getJsonInput(): ?object
    {
        $raw = file_get_contents('php://input');
        return $raw ? json_decode($raw) : null;
    }
}
