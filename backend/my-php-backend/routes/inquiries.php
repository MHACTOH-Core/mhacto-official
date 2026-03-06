<?php
/**
 * Route: /api/inquiries
 *
 * GET    /api/inquiries          — list (optional ?status=)
 * POST   /api/inquiries          — create (public form submission)
 * PUT    /api/inquiries/{id}     — update status
 * POST   /api/inquiries/{id}/reply — save admin reply
 * DELETE /api/inquiries/{id}     — permanently delete
 */

function handle_inquiries(string $method, ?string $idOrAction, ?string $subAction): void
{
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/Inquiry.php';

    try {
        $db = (new Database())->getConnection();
        $inquiry = new Inquiry($db);

        // POST /api/inquiries/{id}/reply
        if ($method === 'POST' && $idOrAction && is_numeric($idOrAction) && $subAction === 'reply') {
            _inquiries_reply($inquiry, (int) $idOrAction);
            return;
        }

        // Numeric id in URL
        $id = ($idOrAction && is_numeric($idOrAction)) ? (int) $idOrAction : null;
        // Fallback: id from query param
        if (!$id && !empty($_GET['id'])) $id = (int) $_GET['id'];

        switch ($method) {
            case 'GET':
                _inquiries_read($inquiry);
                break;
            case 'POST':
                _inquiries_create($inquiry);
                break;
            case 'PUT':
            case 'PATCH':
                if (!$id) Response::error('Missing inquiry ID.', 400);
                _inquiries_update($inquiry, $id);
                break;
            case 'DELETE':
                if (!$id) Response::error('Missing inquiry ID.', 400);
                _inquiries_delete($inquiry, $id);
                break;
            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (Exception $e) {
        error_log("inquiries error: " . $e->getMessage());
        Response::error('Inquiries: ' . $e->getMessage(), 500);
    }
}

// ── GET ─────────────────────────────────────────────────────────────

function _inquiries_read(Inquiry $inquiry): void
{
    $status = $_GET['status'] ?? null;
    $data = $status ? $inquiry->readByStatus($status) : $inquiry->readAll();
    Response::json($data);
}

// ── POST (public create) ────────────────────────────────────────────

function _inquiries_create(Inquiry $inquiry): void
{
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || empty($data['name']) || empty($data['email']) || empty($data['message'])) {
        Response::error('Name, email, and message are required.', 400);
    }

    $success = $inquiry->create([
        'name'              => $data['name'],
        'email'             => $data['email'],
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
        $allowed = ['unread', 'archived', 'spam', 'trash'];
        if (!in_array($data['status'], $allowed, true)) {
            Response::error('Invalid status. Allowed: ' . implode(', ', $allowed), 400);
        }
        $payload['status'] = $data['status'];
    }

    if (empty($payload)) {
        Response::error('No updatable fields provided.', 400);
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

    $success = $inquiry->update($id, [
        'reply_text' => trim($data['reply_text']),
        'replied_at' => date('Y-m-d H:i:s'),
        'replied_by' => $data['replied_by'] ?? 'Admin',
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
