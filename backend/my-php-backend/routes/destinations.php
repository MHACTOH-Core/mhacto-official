<?php
use App\Config\Database;
use App\Models\Destination;
use App\Core\Auth;
use App\Core\Response;
/**
 * Route: /api/destinations
 *
 * GET  /api/destinations     — list destinations
 * POST /api/destinations     — create destination
 */

function handle_destinations(string $method, ?string $id): void
{
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
                $authUser = Auth::requireRole(['super_admin', 'admin', 'content_manager']);
                $data = json_decode(file_get_contents('php://input'), true);

                if (empty($data['title']) || empty($data['description']) || empty($data['location']) || empty($data['hours']) || empty($data['contact'])) {
                    Response::error('Incomplete data. Please fill all fields.', 400);
                }

                $user_id = $authUser['sub'];

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
        Response::error('An internal error occurred.', 500);
    }
}
