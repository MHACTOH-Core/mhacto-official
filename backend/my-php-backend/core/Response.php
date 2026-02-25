<?php
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
     * Emit the CORS headers required by a Next.js frontend.
     * Adjust the origin for production.
     */
    public static function cors(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:3000';

        header("Access-Control-Allow-Origin: {$origin}");
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Credentials: true");
        header("Content-Type: application/json; charset=UTF-8");
    }

    /** Respond to OPTIONS pre-flight and exit. */
    public static function preflight(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
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

    /** Send a JSON response and exit. */
    public static function json(mixed $data, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    /** Shorthand error response. */
    public static function error(string $message, int $code = 400): void
    {
        self::json(['message' => $message], $code);
    }

    /** Decode the raw JSON body. */
    public static function getJsonInput(): ?object
    {
        $raw = file_get_contents('php://input');
        return $raw ? json_decode($raw) : null;
    }
}
