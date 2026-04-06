<?php
use App\Config\Database;
use App\Models\Inquiry;
use App\Core\Auth;
use App\Core\Validator;
use App\Core\Response;
/**
 * Route: /api/inquiries
 *
 * GET    /api/inquiries              — list (optional ?status=)
 * POST   /api/inquiries              — create (public form submission)
 * POST   /api/inquiries/walkin       — log a walk-in from admin panel (auth required)
 * PUT    /api/inquiries/{id}         — update status / assignment
 * POST   /api/inquiries/{id}/reply   — save admin reply
 * POST   /api/inquiries/{id}/confirm — set confirmed_date + assigned_to
 * DELETE /api/inquiries/{id}         — permanently delete
 */

function handle_inquiries(string $method, ?string $idOrAction, ?string $subAction): void
{
    try {
        $db = (new Database())->getConnection();
        $inquiry = new Inquiry($db);

        // POST /api/inquiries/{id}/reply — admin reply
        if ($method === 'POST' && $idOrAction && is_numeric($idOrAction) && $subAction === 'reply') {
            Auth::requireRole(['super_admin', 'admin']);
            _inquiries_reply($inquiry, (int) $idOrAction);
            return;
        }

        // POST /api/inquiries/{id}/confirm — set confirmed_date + guide
        if ($method === 'POST' && $idOrAction && is_numeric($idOrAction) && $subAction === 'confirm') {
            Auth::requireRole(['super_admin', 'admin']);
            _inquiries_confirm($inquiry, (int) $idOrAction);
            return;
        }

        // POST /api/inquiries/walkin — log a walk-in (admin only)
        if ($method === 'POST' && $idOrAction === 'walkin' && !$subAction) {
            Auth::requireRole(['super_admin', 'admin']);
            _inquiries_walkin($inquiry);
            return;
        }

        // Numeric id in URL
        $id = ($idOrAction && is_numeric($idOrAction)) ? (int) $idOrAction : null;
        // Fallback: id from query param
        if (!$id && !empty($_GET['id'])) $id = (int) $_GET['id'];

        switch ($method) {
            case 'GET':
                Auth::requireRole(['super_admin', 'admin']);
                $inquiry->autoExpire();
                _inquiries_read($inquiry);
                break;
            case 'POST':
                // Public form submission — no auth required
                _inquiries_create($inquiry);
                break;
            case 'PUT':
            case 'PATCH':
                Auth::requireRole(['super_admin', 'admin']);
                if (!$id) Response::error('Missing inquiry ID.', 400);
                _inquiries_update($inquiry, $id);
                break;
            case 'DELETE':
                Auth::requireRole(['super_admin', 'admin']);
                if (!$id) Response::error('Missing inquiry ID.', 400);
                _inquiries_delete($inquiry, $id);
                break;
            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (Exception $e) {
        error_log("inquiries error: " . $e->getMessage());
        Response::error('An internal error occurred.', 500);
    }
}

// ── GET ─────────────────────────────────────────────────────────────

function _inquiries_read(Inquiry $inquiry): void
{
    $status = $_GET['status'] ?? null;
    $data = $status ? $inquiry->readByStatus($status) : $inquiry->readAll();

    // Pagination: when ?page= is provided, return paginated envelope
    $page = isset($_GET['page']) ? max(1, (int) $_GET['page']) : null;
    if ($page !== null) {
        $perPage = isset($_GET['per_page']) ? max(1, min((int) $_GET['per_page'], 100)) : 20;
        $total   = count($data);
        $offset  = ($page - 1) * $perPage;
        $paged   = array_slice($data, $offset, $perPage);

        Response::json([
            'items' => array_values($paged),
            'meta'  => [
                'page'     => $page,
                'perPage'  => $perPage,
                'total'    => $total,
                'lastPage' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    Response::json($data);
}

// ── POST (public create) ────────────────────────────────────────────

function _inquiries_create(Inquiry $inquiry): void
{
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        Response::error('Invalid request body.', 400);
    }

    $errors = Validator::validate($data, [
        'name'    => 'required|string|min:2|max:200',
        'email'   => 'required|email|max:255',
        'message' => 'required|string|min:5|max:5000',
        'contactNumber' => 'phone',
        'numberOfPax'   => 'integer|min:1|max:500',
        'dateOfVisit'   => 'date',
    ]);

    if ($errors) {
        Response::error(implode(' ', $errors), 400);
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        Response::error('Invalid email address.', 400);
    }

    if (strlen($data['name']) > 255 || strlen($data['message']) > 10000) {
        Response::error('Field length exceeded.', 400);
    }

    $success = $inquiry->create([
        'name'              => $data['name'],
        'email'             => $data['email'],
        'touristName'       => $data['touristName'] ?? null,
        'contactNumber'     => $data['contactNumber'] ?? null,
        'inquiryType'       => $data['inquiryType'] ?? $data['purpose'] ?? 'general_contact',
        'dateOfVisit'       => $data['dateOfVisit'] ?? null,
        'numberOfPax'       => $data['numberOfPax'] ?? null,
        'message'           => $data['message'],
        'additionalDetails' => $data['additionalDetails'] ?? null,
    ]);

    if ($success) {
        Response::json(['message' => 'Inquiry submitted successfully.'], 201);
    } else {
        Response::error('Failed to submit inquiry.', 500);
    }
}

// ── PUT / PATCH ─────────────────────────────────────────────────────

function _inquiries_update(Inquiry $inquiry, int $id): void
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) Response::error('Request body is required.', 400);

    $payload = [];

    if (isset($data['status'])) {
        $allowed = ['unread', 'read', 'in_progress', 'assigned', 'confirmed', 'completed', 'cancelled', 'expired', 'archived', 'spam', 'trash'];
        if (!in_array($data['status'], $allowed, true)) {
            Response::error('Invalid status. Allowed: ' . implode(', ', $allowed), 400);
        }
        $payload['status'] = $data['status'];
    }

    if (array_key_exists('assigned_to', $data)) {
        $payload['assigned_to'] = $data['assigned_to'] ? trim($data['assigned_to']) : null;
    }

    if (array_key_exists('tourist_name', $data)) {
        $payload['tourist_name'] = $data['tourist_name'] ? trim($data['tourist_name']) : null;
    }

    if (empty($payload)) {
        Response::error('No updatable fields provided (status, assigned_to, tourist_name).', 400);
    }

    $success = $inquiry->update($id, $payload);
    if ($success) {
        $updated = $inquiry->readOne($id);
        Response::json([
            'message' => 'Inquiry updated successfully.',
            'inquiry' => $updated,
        ]);
    } else {
        Response::error('Failed to update inquiry.', 500);
    }
}

// ── POST reply ──────────────────────────────────────────────────────

function _inquiries_reply(Inquiry $inquiry, int $id): void
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty(trim($data['reply_text'] ?? ''))) {
        Response::error('reply_text is required.', 400);
    }

    $authUser = Auth::requireAuth(); // re-extract user info (role already verified by caller)
    $success = $inquiry->update($id, [
        'reply_text' => trim($data['reply_text']),
        'replied_at' => date('Y-m-d H:i:s'),
        'replied_by' => $authUser['email'] ?? 'Admin',
    ]);

    if ($success) {
        $updated = $inquiry->readOne($id);
        Response::json([
            'message' => 'Reply saved successfully.',
            'inquiry' => $updated,
        ]);
    } else {
        Response::error('Failed to save reply.', 500);
    }
}

// ── DELETE ──────────────────────────────────────────────────────────

function _inquiries_delete(Inquiry $inquiry, int $id): void
{
    $success = $inquiry->delete($id);
    if ($success) {
        Response::json(['message' => 'Inquiry deleted successfully.']);
    } else {
        Response::error('Failed to delete inquiry.', 500);
    }
}
// ── POST confirm ──────────────────────────────────────────

function _inquiries_confirm(Inquiry $inquiry, int $id): void
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) Response::error('Request body is required.', 400);

    if (empty($data['confirmed_date'])) {
        Response::error('confirmed_date (YYYY-MM-DD) is required.', 400);
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['confirmed_date'])) {
        Response::error('confirmed_date must be YYYY-MM-DD.', 400);
    }

    $authUser = Auth::requireAuth();

    $payload = [
        'status'         => 'confirmed',
        'confirmed_date' => $data['confirmed_date'],
        'confirmed_by'   => $authUser['email'] ?? 'Admin',
    ];

    if (!empty($data['assigned_to'])) {
        $payload['assigned_to'] = trim($data['assigned_to']);
    }

    if (!empty($data['tourist_name'])) {
        $payload['tourist_name'] = trim($data['tourist_name']);
    }

    $success = $inquiry->update($id, $payload);
    if ($success) {
        $updated = $inquiry->readOne($id);
        Response::json([
            'message' => 'Tour confirmed successfully.',
            'inquiry' => $updated,
        ]);
    } else {
        Response::error('Failed to confirm inquiry.', 500);
    }
}

// ── POST walkin ─────────────────────────────────────────────

function _inquiries_walkin(Inquiry $inquiry): void
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) Response::error('Request body is required.', 400);

    $errors = Validator::validate($data, [
        'name'         => 'required|string|min:2|max:200',
        'numberOfPax'  => 'integer|min:1|max:500',
    ]);

    if ($errors) {
        Response::error(implode(' ', $errors), 400);
    }

    $success = $inquiry->create([
        'name'              => trim($data['name']),
        'touristName'       => isset($data['touristName']) ? trim($data['touristName']) : null,
        'email'             => $data['email'] ?? 'walkin@noemail.local',
        'contactNumber'     => $data['contactNumber'] ?? null,
        'inquiryType'       => 'walk_in',
        'dateOfVisit'       => $data['dateOfVisit'] ?? date('Y-m-d'),
        'numberOfPax'       => $data['numberOfPax'] ?? null,
        'message'           => $data['message'] ?? null,
        'additionalDetails' => $data['additionalDetails'] ?? null,
    ]);

    if ($success) {
        Response::json(['message' => 'Walk-in logged successfully.'], 201);
    } else {
        Response::error('Failed to log walk-in.', 500);
    }
}