<?php
use App\Config\Database;
use App\Models\Settings;
use App\Core\Auth;
use App\Core\Response;
use App\Core\QueryCache;
/**
 * Route: /api/settings
 *
 * GET /api/settings   — read site settings
 * PUT /api/settings   — update site settings
 */

function handle_settings(string $method, ?string $param1): void
{
    try {
        $db = (new Database())->getConnection();
        $settings = new Settings($db);

        switch ($method) {
            case 'GET':
                // Cache settings for 10 minutes; rarely changes
                QueryCache::httpCacheHeaders(600);
                $data = QueryCache::remember('settings_all', 600, fn() => $settings->read());
                Response::json($data);
                break;

            case 'PUT':
                Auth::requireRole('super_admin');
                $data = json_decode(file_get_contents('php://input'), true);
                if (!$data) Response::error('No data provided.', 400);

                $updated = $settings->update($data);
                QueryCache::forget('settings_all'); // Invalidate cached settings
                Response::json([
                    'message'  => 'Settings updated successfully.',
                    'settings' => $updated,
                ]);
                break;

            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (Exception $e) {
        error_log("settings error: " . $e->getMessage());
        Response::error('An internal error occurred.', 500);
    }
}
