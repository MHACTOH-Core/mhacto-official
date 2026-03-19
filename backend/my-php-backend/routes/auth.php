<?php
use App\Config\Database;
use App\Models\User;
use App\Core\Auth;
use App\Core\Response;
/**
 * Route: /api/auth
 *
 * POST /api/auth/login — authenticate admin user, return JWT
 * GET  /api/auth/me    — verify token, return current user
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
        default:
            Response::error('Not found.', 404);
    }
}

// ── Login ───────────────────────────────────────────────────────

function _auth_login(string $method): void
{
    if ($method !== 'POST') {
        Response::error('Method not allowed. Use POST.', 405);
    }

    $data = Response::getJsonInput();

    if (empty($data->email) || empty($data->password)) {
        Response::error('Please provide both email and password.', 400);
    }

    try {
        $db   = (new Database())->getConnection();
        $user = new User($db);

        $row = $user->findByEmail($data->email);

        if (!$row) {
            Response::json([
                'success'    => false,
                'error_code' => 'user_not_found',
                'message'    => 'No account found with this email.',
            ], 401);
            return;
        }

        if ($row['status'] !== 'active') {
            Response::json([
                'success'    => false,
                'error_code' => 'account_disabled',
                'message'    => 'This account has been deactivated.',
            ], 401);
            return;
        }

        if (!password_verify($data->password, $row['password_hash'])) {
            Response::json([
                'success'    => false,
                'error_code' => 'wrong_password',
                'message'    => 'Incorrect password.',
            ], 401);
            return;
        }

        unset($row['password_hash'], $row['status']);
        $user = [
            'id'             => $row['user_id'],
            'username'       => $row['username'],
            'fullName'       => $row['full_name'] ?? $row['username'],
            'profilePicture' => $row['profile_picture'] ?? null,
            'email'          => $row['email'],
            'role'           => $row['role'] ?? 'admin',
        ];

        $token = Auth::generateToken([
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ]);

        Response::json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => $user,
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

    $authUser = Auth::requireAuth(); // 401 if invalid

    try {
        $db   = (new Database())->getConnection();
        $stmt = $db->prepare(
            "SELECT user_id, username, full_name, profile_picture, email, role
             FROM users WHERE user_id = :id AND status = 'active' LIMIT 1"
        );
        $stmt->bindParam(':id', $authUser['sub'], PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            Response::error('User not found or deactivated.', 401);
        }

        Response::json([
            'user' => [
                'id'             => $row['user_id'],
                'username'       => $row['username'],
                'fullName'       => $row['full_name'] ?? $row['username'],
                'profilePicture' => $row['profile_picture'] ?? null,
                'email'          => $row['email'],
                'role'           => $row['role'] ?? 'admin',
            ],
        ]);
    } catch (Exception $e) {
        error_log("auth/me error: " . $e->getMessage());
        Response::error('Internal server error.', 500);
    }
}
