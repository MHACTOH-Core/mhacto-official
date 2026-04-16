<?php
use App\Config\Database;
use App\Models\User;
use App\Core\Auth;
use App\Core\Response;
use App\Core\RateLimit;

/**
 * Route: /api/auth
 *
 * POST /api/auth/login   — authenticate admin user, return JWT
 * GET  /api/auth/me      — verify token, return current user
 * POST /api/auth/refresh — issue a new JWT for a recently-expired token
 */

function handle_auth(string $method, ?string $action): void
{
    switch ($action) {
        case 'login':
            _auth_login($method);
            break;
        case 'me':
            _auth_me($method);
            break;
        case 'refresh':
            _auth_refresh($method);
            break;
        default:
            Response::error('Not found.', 404);
    }
}

// ── Private helper ──────────────────────────────────────────────

/**
 * Map a User DB row to the camelCase shape expected by the frontend.
 * Single source of truth — eliminates the duplicated mapping in login/me.
 *
 * @param array $row  A row returned by User::findByEmail() or User::findById()
 */
function _auth_format_user(array $row): array
{
    return [
        'id'             => (int) $row['user_id'],
        'username'       => $row['username'],
        'fullName'       => $row['full_name'] ?? $row['username'],
        'profilePicture' => $row['profile_picture'] ?? null,
        'email'          => $row['email'],
        'role'           => $row['role'] ?? 'admin',
    ];
}

// ── Login ───────────────────────────────────────────────────────

function _auth_login(string $method): void
{
    if ($method !== 'POST') {
        Response::error('Method not allowed. Use POST.', 405);
    }

    // Brute-force protection: max 10 login attempts per IP per 15 minutes
    RateLimit::check('login', 10, 900);

    $data = Response::getJsonInput();

    if (empty($data->email) || empty($data->password)) {
        Response::error('Please provide both email and password.', 400);
    }

    try {
        $db       = (new Database())->getConnection();
        $userModel = new User($db);

        $row = $userModel->findByEmail($data->email);

        if (!$row) {
            Response::error('No account found with this email.', 401);
        }

        if ($row['status'] !== 'active') {
            Response::error('This account has been deactivated.', 401);
        }

        if (!password_verify($data->password, $row['password_hash'])) {
            Response::error('Incorrect password.', 401);
        }

        $userPayload = _auth_format_user($row);

        $token = Auth::generateToken([
            'id'    => $userPayload['id'],
            'email' => $userPayload['email'],
            'role'  => $userPayload['role'],
        ]);

        Response::json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => $userPayload,
        ]);
    } catch (Exception $e) {
        error_log("auth/login error: " . $e->getMessage());
        Response::error('Internal server error.', 500);
    }
}

// ── Verify token / current user ─────────────────────────────────

function _auth_me(string $method): void
{
    if ($method !== 'GET') {
        Response::error('Method not allowed. Use GET.', 405);
    }

    $authUser = Auth::requireAuth(); // exits with 401 if token is missing/invalid

    try {
        $db        = (new Database())->getConnection();
        $userModel = new User($db);

        $row = $userModel->findById((int) $authUser['sub']);

        if (!$row || ($row['status'] ?? '') !== 'active') {
            Response::error('User not found or deactivated.', 401);
        }

        Response::json(['user' => _auth_format_user($row)]);
    } catch (Exception $e) {
        error_log("auth/me error: " . $e->getMessage());
        Response::error('Internal server error.', 500);
    }
}

// ── Refresh token ───────────────────────────────────────────────

function _auth_refresh(string $method): void
{
    if ($method !== 'POST') {
        Response::error('Method not allowed. Use POST.', 405);
    }

    // Allow tokens that expired up to 1 hour ago
    $payload = Auth::decodeWithGrace(3600);

    if (!$payload) {
        Response::error('Token cannot be refreshed.', 401);
    }

    try {
        $db        = (new Database())->getConnection();
        $userModel = new User($db);

        $row = $userModel->findById((int) $payload['sub']);

        if (!$row || ($row['status'] ?? '') !== 'active') {
            Response::error('User not found or deactivated.', 401);
        }

        $newToken = Auth::generateToken([
            'id'    => (int) $row['user_id'],
            'email' => $row['email'],
            'role'  => $row['role'],
        ]);

        Response::json(['token' => $newToken]);
    } catch (Exception $e) {
        error_log("auth/refresh error: " . $e->getMessage());
        Response::error('Internal server error.', 500);
    }
}
