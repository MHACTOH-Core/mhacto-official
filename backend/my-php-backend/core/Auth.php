<?php
namespace App\Core;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

/**
 * core/security.php — JWT authentication utilities.
 *
 * Usage:
 *   // Generate a token on login
 *   $token = Auth::generateToken(['id' => 1, 'email' => 'admin@example.com', 'role' => 'admin']);
 *
 *   // Protect an endpoint (returns decoded payload or exits with 401)
 *   $user = Auth::requireAuth();
 *   echo $user['id'];
 */

class Auth
{
    /**
     * Generate a signed JWT for the given user payload.
     *
     * @param array{id: int, email: string, role: string} $user
     * @return string  The encoded JWT string
     */
    public static function generateToken(array $user): string
    {
        $secret = self::getSecret();
        $expiryHours = (int)($_ENV['JWT_EXPIRY_HOURS'] ?? 8);

        $payload = [
            'iss' => 'mhacto-api',
            'iat' => time(),
            'exp' => time() + ($expiryHours * 3600),
            'sub' => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ];

        return JWT::encode($payload, $secret, 'HS256');
    }

    /**
     * Validate the JWT from the Authorization header and return the decoded payload.
     * Exits with 401 if the token is missing, expired, or invalid.
     *
     * @return array{sub: int, email: string, role: string}
     */
    public static function requireAuth(): array
    {
        $token = self::extractBearerToken();

        if (!$token) {
            Response::error('Authentication required.', 401);
        }

        try {
            $decoded = JWT::decode($token, new Key(self::getSecret(), 'HS256'));
            return (array) $decoded;
        } catch (ExpiredException $e) {
            Response::error('Token expired. Please log in again.', 401);
        } catch (\Exception $e) {
            Response::error('Invalid token.', 401);
        }

        // Unreachable — Response::error exits — but keeps static analysis happy
        exit();
    }

    /**
     * Require the authenticated user to have one of the given roles.
     * Calls requireAuth() first, then checks the role claim.
     *
     * @param string|string[] $roles  A single role or array of allowed roles
     * @return array  The decoded JWT payload
     */
    public static function requireRole(string|array $roles): array
    {
        $user = self::requireAuth();
        $allowed = is_array($roles) ? $roles : [$roles];

        if (!in_array($user['role'] ?? '', $allowed, true)) {
            Response::error('You do not have permission to perform this action.', 403);
        }

        return $user;
    }

    /**
     * Extract the Bearer token from the Authorization header.
     */
    private static function extractBearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Read the JWT secret from the environment.
     */
    private static function getSecret(): string
    {
        $secret = $_ENV['JWT_SECRET'] ?? '';
        if (!$secret) {
            error_log('CRITICAL: JWT_SECRET is not set in .env');
            Response::error('Server configuration error.', 500);
        }
        return $secret;
    }
}
