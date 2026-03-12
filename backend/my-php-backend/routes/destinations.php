<?php
/**
 * Route: /api/destinations
 *
 * GET  /api/destinations     — list destinations
 * POST /api/destinations     — create destination
 */

function handle_destinations(string $method, ?string $id, ?string $param2): void
{
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/Destination.php';

    try {
        $db = (new Database())->getConnection();
        $destination = new Destination($db);

        switch ($method) {
            case 'GET':
                $stmt = $destination->readAll();
                $destinations = $stmt->fetchAll(PDO::FETCH_ASSOC);
                Response::json($destinations);
                break;

            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);

                if (empty($data['title']) || empty($data['description']) || empty($data['location']) || empty($data['hours']) || empty($data['contact'])) {
                    Response::error('Incomplete data. Please fill all fields.', 400);
                }

                // Hardcoded user 1 until auth tokens are implemented
                $user_id = 1;

                $success = $destination->create(
                    $user_id,
                    $data['title'],
                    $data['description'],
                    $data['location'],
                    $data['hours'],
                    $data['contact']
                );

                if ($success) {
                    Response::json(['message' => 'Tourist spot created successfully!'], 201);
                } else {
                    Response::error('Unable to create tourist spot.', 503);
                }
                break;

            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (Exception $e) {
        error_log("destinations error: " . $e->getMessage());
        Response::error('Destinations: ' . $e->getMessage(), 500);
    }
}
