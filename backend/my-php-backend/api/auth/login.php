<?php
/**
 * POST /api/auth/login.php
 * Accepts: { "email": "...", "password": "..." }
 * Returns: { "message", "user": { "id", "username", "email", "role" } }
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('POST');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';

$data = Response::getJsonInput();

// Validate required fields
if (empty($data->email) || empty($data->password)) {
    Response::error('Please provide both email and password.', 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    $userData = $user->loginByEmail($data->email, $data->password);

    if ($userData) {
        Response::json([
            'message' => 'Login successful',
            'user' => [
                'id'       => $userData['user_id'],
                'username' => $userData['username'],
                'email'    => $userData['email'],
                'role'     => $userData['role'],
            ],
        ]);
    } else {
        Response::error('Invalid email or password.', 401);
    }
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    Response::error('Internal server error.', 500);
}