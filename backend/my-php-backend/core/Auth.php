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
     * Decode the Bearer token, allowing up to $graceSeconds past expiry.
     * Returns the decoded payload or null if the token is missing/invalid/too old.
     *
     * @param int $graceSeconds  How many seconds past exp to still accept
     * @return array|null
     */
    public static function decodeWithGrace(int $graceSeconds = 3600): ?array
    {
        $token = self::extractBearerToken();
        if (!$token) return null;

        try {
            // Accept tokens up to $graceSeconds past expiry
            JWT::$leeway = $graceSeconds;
            $decoded = JWT::decode($token, new Key(self::getSecret(), 'HS256'));
            JWT::$leeway = 0;
            return (array) $decoded;
        } catch (\Exception $e) {
            JWT::$leeway = 0;
            return null;
        }
    }

    /**
     * Optionally authenticate: return decoded JWT payload if a valid token
     * is present, or null if not. Does NOT exit on missing/invalid token.
     */
    public static function optionalAuth(): ?array
    {
        $token = self::extractBearerToken();
        if (!$token) return null;

        try {
            $decoded = JWT::decode($token, new Key(self::getSecret(), 'HS256'));
            return (array) $decoded;
        } catch (\Exception $e) {
            return null;
        }
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
     * Tries multiple sources to handle Apache CGI, FastCGI, and PHP CLI server
     * environments where HTTP_AUTHORIZATION may not be in $_SERVER.
     */
    private static function extractBearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        // Fallback: some environments (Apache CGI/FastCGI) strip HTTP_AUTHORIZATION
        // from $_SERVER. getallheaders() reads directly from the request headers.
        if (!$header && function_exists('getallheaders')) {
            foreach (getallheaders() as $name => $value) {
                if (strtolower($name) === 'authorization') {
                    $header = $value;
                    break;
                }
            }
        }

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

    // ── IDOR Prevention ───────────────────────────────────────────────

    /**
     * Prevent Insecure Direct Object Reference (IDOR) attacks.
     *
     * Verifies that the authenticated user is either:
     *   (a) A super_admin or admin — can access any resource, or
     *   (b) The owner of the requested resource (user_id matches sub claim)
     *
     * Usage (in any route handler):
     *   $user = Auth::requireAuth();
     *   Auth::canAccess($user, $row['user_id']);  // 403 if not owner/admin
     *
     * @param array      $authUser   Decoded JWT payload from requireAuth()
     * @param int|null   $ownerId    user_id who owns the resource (null = no owner)
     * @param string[]   $adminRoles Roles that bypass ownership check
     */
    public static function canAccess(array $authUser, ?int $ownerId, array $adminRoles = ['super_admin', 'admin']): void
    {
        $role    = $authUser['role'] ?? '';
        $subject = (int) ($authUser['sub'] ?? 0);

        // Privileged roles bypass ownership checks
        if (in_array($role, $adminRoles, true)) {
            return;
        }

        // Resource has no owner — deny non-admins
        if ($ownerId === null) {
            Response::error('Access denied.', 403);
        }

        // Ownership check: caller must own the resource
        if ($subject !== $ownerId) {
            // Log the IDOR attempt for audit purposes
            error_log(sprintf(
                'IDOR attempt: user #%d (role=%s) tried to access resource owned by user #%d | IP=%s | URI=%s',
                $subject,
                $role,
                $ownerId,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['REQUEST_URI'] ?? 'unknown'
            ));
            Response::error('Access denied. You do not own this resource.', 403);
        }
    }

    /**
     * Fetch a resource row and assert the authenticated user can access it.
     * Combines a PDO lookup + canAccess() in one call to prevent the
     * "fetch then forget to check" pattern that leads to IDOR bugs.
     *
     * @param array    $authUser     Decoded JWT payload
     * @param \PDO     $db           Active PDO connection
     * @param string   $table        Table name (validated against allowlist)
     * @param string   $pkColumn     Primary key column name
     * @param int      $pkValue      Requested resource ID
     * @param string   $ownerColumn  Column that holds the owner's user_id
     * @param string[] $adminRoles   Roles that bypass ownership check
     * @return array   The fetched row
     */
    public static function fetchAndAssertAccess(
        array $authUser,
        \PDO $db,
        string $table,
        string $pkColumn,
        int $pkValue,
        string $ownerColumn = 'user_id',
        array $adminRoles = ['super_admin', 'admin']
    ): array {
        // Allow-list table names to prevent SQL injection via $table parameter
        $allowedTables = ['content', 'inquiries', 'users', 'activity_logs', 'milestones', 'page_views'];
        if (!in_array($table, $allowedTables, true)) {
            Response::error('Invalid resource type.', 400);
        }

        // Column names — only allow alphanumeric + underscore
        if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $pkColumn) ||
            !preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $ownerColumn)) {
            Response::error('Invalid column reference.', 400);
        }

        $stmt = $db->prepare("SELECT * FROM `{$table}` WHERE `{$pkColumn}` = :id LIMIT 1");
        $stmt->execute([':id' => $pkValue]);
        $row  = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$row) {
            Response::error('Resource not found.', 404);
        }

        $ownerId = isset($row[$ownerColumn]) ? (int) $row[$ownerColumn] : null;
        self::canAccess($authUser, $ownerId, $adminRoles);

        return $row;
    }
}

