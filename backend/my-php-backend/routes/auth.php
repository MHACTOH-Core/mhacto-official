<?php
/**
 * Route: /api/auth
 *
 * POST /api/auth/login — authenticate admin user
 */

function handle_auth(string $method, ?string $action, ?string $param2): void
{
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/User.php';

    switch ($action) {
        case 'login':
            _auth_login($method);
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

        // First check if the email exists at all
        $stmt = $db->prepare(
            "SELECT user_id, username, full_name, profile_picture, email, password_hash, role, status
             FROM users WHERE email = :email LIMIT 1"
        );
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            Response::json([
                'success'    => false,
                'error_code' => 'user_not_found',
                'message'    => 'No account found with this email.',
            ], 401);
            return;
        }

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

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
        Response::json([
            'message' => 'Login successful',
            'user'    => [
                'id'             => $row['user_id'],
                'username'       => $row['username'],
                'fullName'       => $row['full_name'] ?? $row['username'],
                'profilePicture' => $row['profile_picture'] ?? null,
                'email'          => $row['email'],
                'role'           => $row['role'] ?? 'admin',
            ],
        ]);
    } catch (Exception $e) {
        error_log("auth/login error: " . $e->getMessage());
        Response::error('Internal server error.', 500);
    }
}
