<?php
/**
 * Route: /api/auth
 *
 * POST /api/auth/login  — authenticate admin user
 */

function handle_auth(string $method, ?string $action, ?string $param2): void
{
    if ($action !== 'login') {
        Response::error('Not found.', 404);
    }

    if ($method !== 'POST') {
        Response::error('Method not allowed. Use POST.', 405);
    }

    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/User.php';

    $data = Response::getJsonInput();

    if (empty($data->email) || empty($data->password)) {
        Response::error('Please provide both email and password.', 400);
    }

    try {
        $db = (new Database())->getConnection();
        $user = new User($db);

        $userData = $user->loginByEmail($data->email, $data->password);

        if ($userData) {
            Response::json([
                'message' => 'Login successful',
                'user'    => [
                    'id'       => $userData['user_id'],
                    'username' => $userData['username'],
                    'email'    => $userData['email'],
                ],
            ]);
        } else {
            Response::error('Invalid email or password.', 401);
        }
    } catch (Exception $e) {
        error_log("auth/login error: " . $e->getMessage());
        Response::error('Internal server error.', 500);
    }
}
