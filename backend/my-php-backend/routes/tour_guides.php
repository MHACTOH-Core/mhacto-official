<?php
use App\Config\Database;
use App\Models\TourGuide;
use App\Core\Auth;
use App\Core\Validator;
use App\Core\Response;

/**
 * Route: /api/tour_guides
 *
 * GET    /api/tour_guides                              — list all guides
 * POST   /api/tour_guides                              — create guide
 * PUT    /api/tour_guides/{id}                         — update guide
 * DELETE /api/tour_guides/{id}                         — permanently delete guide
 *
 * Appointments sub-resource:
 * GET    /api/tour_guides/{id}/appointments            — list appointments for guide
 * POST   /api/tour_guides/{id}/appointments            — create appointment
 * PUT    /api/tour_guides/{id}/appointments?apptId=X   — update appointment
 * DELETE /api/tour_guides/{id}/appointments?apptId=X   — delete appointment
 */

function handle_tour_guides(string $method, ?string $idOrAction, ?string $subAction): void
{
    try {
        $db    = (new Database())->getConnection();
        $guide = new TourGuide($db);

        $id = ($idOrAction && is_numeric($idOrAction)) ? (int) $idOrAction : null;
        if (!$id && !empty($_GET['id'])) $id = (int) $_GET['id'];

        $readOnlyRoles = ['super_admin', 'admin', 'content_manager'];
        $writeRoles    = ['super_admin', 'admin'];

        // ── Appointments sub-resource ──────────────────────────────
        if ($subAction === 'appointments') {
            Auth::requireRole($writeRoles);
            if (!$id) Response::error('Missing guide ID.', 400);
            _tour_guides_appointments($guide, $method, $id);
            return;
        }

        // ── Guide CRUD ─────────────────────────────────────────────
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
        $nameErrors = Validator::validate(['fullName' => $data['fullName']], ['fullName' => 'required|string|min:2|max:200']);
        if ($nameErrors) Response::error(implode(' ', $nameErrors), 400);
        $payload['fullName'] = $data['fullName'];
    }

    if (array_key_exists('phoneNumber', $data)) {
        if ($data['phoneNumber'] !== null && $data['phoneNumber'] !== '') {
            $phoneErrors = Validator::validate(['phoneNumber' => $data['phoneNumber']], ['phoneNumber' => 'phone']);
            if ($phoneErrors) Response::error(implode(' ', $phoneErrors), 400);
        }
        $payload['phoneNumber'] = $data['phoneNumber'] ?: null;
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

// ── APPOINTMENTS sub-resource ────────────────────────────────────────
// GET    /api/tour_guides/{id}/appointments           — list
// POST   /api/tour_guides/{id}/appointments           — create
// PUT    /api/tour_guides/{id}/appointments?apptId=X  — update
// DELETE /api/tour_guides/{id}/appointments?apptId=X  — delete

function _tour_guides_appointments(TourGuide $guide, string $method, int $guideId): void
{
    $apptId = isset($_GET['apptId']) && is_numeric($_GET['apptId']) ? (int) $_GET['apptId'] : null;

    switch ($method) {
        case 'GET':
            $list = $guide->getAppointments($guideId);
            Response::json($list);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) Response::error('Invalid request body.', 400);

            $errors = Validator::validate($data, [
                'title'         => 'required|string|min:2|max:200',
                'startDatetime' => 'required|string',
                'endDatetime'   => 'required|string',
            ]);
            if ($errors) Response::error(implode(' ', $errors), 400);

            // Validate datetime format and chronology
            $start = strtotime($data['startDatetime']);
            $end   = strtotime($data['endDatetime']);
            if (!$start || !$end) Response::error('Invalid datetime format.', 400);
            if ($end <= $start)   Response::error('End time must be after start time.', 400);

            $newId = $guide->createAppointment($guideId, [
                'title'         => $data['title'],
                'startDatetime' => date('Y-m-d H:i:s', $start),
                'endDatetime'   => date('Y-m-d H:i:s', $end),
                'notes'         => isset($data['notes']) ? substr((string) $data['notes'], 0, 1000) : null,
            ]);

            if ($newId === false) Response::error('Failed to create appointment.', 500);

            $created = $guide->getAppointment($newId);
            Response::json(['message' => 'Appointment created.', 'appointment' => $created], 201);
            break;

        case 'PUT':
        case 'PATCH':
            if (!$apptId) Response::error('Missing apptId query parameter.', 400);
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) Response::error('Invalid request body.', 400);

            $payload = [];
            if (array_key_exists('title', $data))         $payload['title']         = $data['title'];
            if (array_key_exists('notes', $data))         $payload['notes']         = $data['notes'];
            if (array_key_exists('startDatetime', $data)) {
                $start = strtotime($data['startDatetime']);
                if (!$start) Response::error('Invalid startDatetime.', 400);
                $payload['startDatetime'] = date('Y-m-d H:i:s', $start);
            }
            if (array_key_exists('endDatetime', $data)) {
                $end = strtotime($data['endDatetime']);
                if (!$end) Response::error('Invalid endDatetime.', 400);
                $payload['endDatetime'] = date('Y-m-d H:i:s', $end);
            }

            if (isset($payload['startDatetime'], $payload['endDatetime'])) {
                if (strtotime($payload['endDatetime']) <= strtotime($payload['startDatetime'])) {
                    Response::error('End time must be after start time.', 400);
                }
            }

            if (empty($payload)) Response::error('No updatable fields provided.', 400);

            $ok = $guide->updateAppointment($apptId, $payload);
            if (!$ok) Response::error('Failed to update appointment.', 500);

            $updated = $guide->getAppointment($apptId);
            Response::json(['message' => 'Appointment updated.', 'appointment' => $updated]);
            break;

        case 'DELETE':
            if (!$apptId) Response::error('Missing apptId query parameter.', 400);
            $ok = $guide->deleteAppointment($apptId);
            if ($ok) {
                Response::json(['message' => 'Appointment deleted.']);
            } else {
                Response::error('Failed to delete appointment.', 500);
            }
            break;

        default:
            Response::error('Method not allowed.', 405);
    }
}
