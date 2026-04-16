<?php
use App\Config\Database;
use App\Models\ActivityLog;
use App\Core\Auth;
use App\Core\Response;
/**
 * Route: /api/activity
 *
 * GET  /api/activity         — read activity log (?limit=100)
 * POST /api/activity         — log an admin action
 */

function handle_activity(string $method, ?string $param1): void
{
    // All activity log operations require authentication
    $authUser = Auth::requireAuth();

    try {
        $db  = (new Database())->getConnection();
        $log = new ActivityLog($db);

        switch ($method) {
            case 'GET':
                $limit = isset($_GET['limit']) ? max(1, min((int) $_GET['limit'], 500)) : 100;
                $role  = $authUser['role'] ?? 'admin';
                if ($role === 'super_admin') {
                    Response::json($log->readAll($limit));
                } else {
                    $userId = (int) $authUser['sub'];
                    Response::json($log->readByUser($userId, $limit));
                }
                break;

            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                if (!$data || empty($data['action']) || empty($data['description'])) {
                    Response::error('Action and description are required.', 400);
                }
                $action      = substr((string) $data['action'], 0, 50);
                $description = substr((string) $data['description'], 0, 500);
                $detailsJson = json_encode(['description' => $description]);

                $entry = $log->log(
                    $action,
                    $detailsJson,
                    (int) $authUser['sub'],
                    null,
                    isset($data['contentId']) ? (int) $data['contentId'] : null
                );

                if ($entry) {
                    Response::json($entry, 201);
                } else {
                    Response::error('Failed to log activity.', 500);
                }
                break;

            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (Exception $e) {
        error_log("activity error: " . $e->getMessage());
        Response::error('An internal error occurred.', 500);
    }
}
