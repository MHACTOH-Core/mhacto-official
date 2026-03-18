<?php
/**
 * Route: /api/settings
 *
 * GET /api/settings   — read site settings
 * PUT /api/settings   — update site settings
 */

function handle_settings(string $method, ?string $param1): void
{
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/Settings.php';

    try {
        $db = (new Database())->getConnection();
        $settings = new Settings($db);

        switch ($method) {
            case 'GET':
                Response::json($settings->read());
                break;

            case 'PUT':
                $data = json_decode(file_get_contents('php://input'), true);
                if (!$data) Response::error('No data provided.', 400);

                $updated = $settings->update($data);
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
        Response::error('Settings: ' . $e->getMessage(), 500);
    }
}
