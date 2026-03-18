<?php
/**
 * security.php — JWT authentication utilities.
 *
 * Implements HMAC-SHA256 JWT generation and verification without
 * external libraries.  The signing secret is loaded from
 * config/jwt.local.php (git-ignored) with a fallback that forces
 * you to set one in production.
 *
 * Usage:
 *   require_once __DIR__ . '/security.php';
 *   Auth::requireAuth();            // 401 if no valid token
 *   $user = Auth::getAuthUser();    // decoded JWT payload or null
 */

require_once __DIR__ . '/Response.php';

class Auth
{
    private static ?string $secret = null;

    /** Token lifetime in seconds (8 hours). */
    private const TOKEN_TTL = 28800;

    // ── Secret management ──────────────────────────────────────────

    private static function getSecret(): string
    {
        if (self::$secret !== null) return self::$secret;

        $localConfig = __DIR__ . '/../config/jwt.local.php';
        if (file_exists($localConfig)) {
            $cfg = require $localConfig;
            if (!empty($cfg['secret'])) {
                self::$secret = $cfg['secret'];
                return self::$secret;
            }
        }

        // Halt — never fall back to a weak default in production.
        Response::error('JWT secret not configured. See config/jwt.local.php.', 500);
        exit(); // unreachable, but explicit
    }

    // ── Base64-URL helpers (RFC 7515) ──────────────────────────────

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    // ── Token generation ───────────────────────────────────────────

    /**
     * Create a signed JWT for the given user.
     *
     * @param  int    $userId
     * @param  string $role   e.g. "admin", "super_admin"
     * @param  string $email
     * @return string  Encoded JWT (header.payload.signature)
     */
    public static function generateToken(int $userId, string $role, string $email): string
    {
        $header  = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $now     = time();
        $payload = self::base64UrlEncode(json_encode([
            'sub'   => $userId,
            'role'  => $role,
            'email' => $email,
            'iat'   => $now,
            'exp'   => $now + self::TOKEN_TTL,
        ]));

        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payload}", self::getSecret(), true)
        );

        return "{$header}.{$payload}.{$signature}";
    }

    // ── Token verification ─────────────────────────────────────────

    /**
     * Decode and verify a JWT string.
     *
     * @return array{sub:int, role:string, email:string, iat:int, exp:int}|null
     */
    public static function verifyToken(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $signature] = $parts;

        // Re-compute the expected signature
        $expected = self::base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payload}", self::getSecret(), true)
        );

        if (!hash_equals($expected, $signature)) return null;

        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!is_array($data)) return null;

        // Check expiration
        if (($data['exp'] ?? 0) < time()) return null;

        return $data;
    }

    // ── Middleware helpers ──────────────────────────────────────────

    /**
     * Extract the Bearer token from the Authorization header.
     */
    private static function getBearerToken(): ?string
    {
        // Apache may expose the header via different keys
        $authHeader = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        if (preg_match('/^Bearer\s+(\S+)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Decode the current request's JWT (if any) without aborting.
     *
     * @return array|null  Decoded payload or null
     */
    public static function getAuthUser(): ?array
    {
        $token = self::getBearerToken();
        if (!$token) return null;
        return self::verifyToken($token);
    }

    /**
     * Abort with 401 if the request does not carry a valid JWT.
     *
     * @return array  Decoded JWT payload (guaranteed non-null)
     */
    public static function requireAuth(): array
    {
        $user = self::getAuthUser();
        if (!$user) {
            Response::error('Authentication required.', 401);
        }
        return $user;
    }
}
