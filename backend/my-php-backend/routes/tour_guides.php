<?php
use App\Config\Database;
use App\Models\TourGuide;
use App\Core\Auth;
use App\Core\Validator;
use App\Core\Response;

/**
 * Route: /api/tour_guides
 *
 * GET    /api/tour_guides          — list all guides (auth required; ?active=1 for available-only)
 * POST   /api/tour_guides          — create guide
 * PUT    /api/tour_guides/{id}     — update guide (fullName, phoneNumber, availability, isActive)
 * DELETE /api/tour_guides/{id}     — permanently delete
 */

function handle_tour_guides(string $method, ?string $idOrAction, ?string $subAction): void
{
    try {
        $db    = (new Database())->getConnection();
        $guide = new TourGuide($db);

        $id = ($idOrAction && is_numeric($idOrAction)) ? (int) $idOrAction : null;
        if (!$id && !empty($_GET['id'])) $id = (int) $_GET['id'];

        // Content managers can view tour guides; only admins can modify
        $readOnlyRoles = ['super_admin', 'admin', 'content_manager'];
        $writeRoles    = ['super_admin', 'admin'];

        switch ($method) {
            case 'GET':
                Auth::requireRole($readOnlyRoles);
                _tour_guides_read($guide);
                break;
            case 'POST':
                Auth::requireRole($writeRoles);
                _tour_guides_create($guide);
                break;
            case 'PUT':
            case 'PATCH':
                Auth::requireRole($writeRoles);
                if (!$id) Response::error('Missing guide ID.', 400);
                _tour_guides_update($guide, $id);
                break;
            case 'DELETE':
                Auth::requireRole($writeRoles);
                if (!$id) Response::error('Missing guide ID.', 400);
                _tour_guides_delete($guide, $id);
                break;
            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (Exception $e) {
        error_log("tour_guides error: " . $e->getMessage());
        Response::error('An internal error occurred.', 500);
    }
}

// ── GET ─────────────────────────────────────────────────────────────

function _tour_guides_read(TourGuide $guide): void
{
    $activeOnly = isset($_GET['active']) && $_GET['active'] === '1';
    Response::json($guide->readAll($activeOnly));
}

// ── POST ────────────────────────────────────────────────────────────

function _tour_guides_create(TourGuide $guide): void
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) Response::error('Invalid request body.', 400);

    $errors = Validator::validate($data, [
        'fullName' => 'required|string|min:2|max:200',
        'phoneNumber' => 'phone',
    ]);
    if ($errors) Response::error(implode(' ', $errors), 400);

    $allowed = ['available', 'unavailable', 'on_tour'];
    if (isset($data['availability']) && !in_array($data['availability'], $allowed, true)) {
        Response::error('Invalid availability. Allowed: ' . implode(', ', $allowed), 400);
    }

    $newId = $guide->create([
        'fullName'     => $data['fullName'],
        'phoneNumber'  => $data['phoneNumber'] ?? null,
        'availability' => $data['availability'] ?? 'available',
    ]);

    if ($newId !== false) {
        $created = $guide->readOne($newId);
        Response::json(['message' => 'Tour guide created.', 'guide' => $created], 201);
    } else {
        Response::error('Failed to create tour guide.', 500);
    }
}

// ── PUT / PATCH ─────────────────────────────────────────────────────

function _tour_guides_update(TourGuide $guide, int $id): void
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) Response::error('Request body is required.', 400);

    $payload = [];

    if (array_key_exists('fullName', $data)) {
        if (empty(trim($data['fullName']))) Response::error('fullName cannot be empty.', 400);
        $payload['fullName'] = $data['fullName'];
    }

    if (array_key_exists('phoneNumber', $data)) {
        $payload['phoneNumber'] = $data['phoneNumber'];
    }

    if (array_key_exists('availability', $data)) {
        $allowed = ['available', 'unavailable', 'on_tour'];
        if (!in_array($data['availability'], $allowed, true)) {
            Response::error('Invalid availability. Allowed: ' . implode(', ', $allowed), 400);
        }
        $payload['availability'] = $data['availability'];
    }

    if (array_key_exists('isActive', $data)) {
        $payload['isActive'] = $data['isActive'];
    }

    if (empty($payload)) Response::error('No updatable fields provided.', 400);

    $success = $guide->update($id, $payload);
    if ($success) {
        $updated = $guide->readOne($id);
        Response::json(['message' => 'Tour guide updated.', 'guide' => $updated]);
    } else {
        Response::error('Failed to update tour guide.', 500);
    }
}

// ── DELETE ──────────────────────────────────────────────────────────

function _tour_guides_delete(TourGuide $guide, int $id): void
{
    $success = $guide->delete($id);
    if ($success) {
        Response::json(['message' => 'Tour guide deleted.']);
    } else {
        Response::error('Failed to delete tour guide.', 500);
    }
}
