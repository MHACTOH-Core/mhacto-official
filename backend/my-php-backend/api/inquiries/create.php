<?php
/**
 * POST /api/inquiries/create.php
 * Public endpoint — creates a new inquiry from the tourist site form.
 *
 * Body: {
 *   name: string,
 *   email: string,
 *   contactNumber?: string,
 *   purpose?: string,
 *   dateOfVisit?: string,
 *   numberOfPax?: int,
 *   message: string
 * }
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();
Response::requireMethod('POST');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Inquiry.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $inquiry = new Inquiry($db);

    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (!$data || empty($data['name']) || empty($data['email']) || empty($data['message'])) {
        Response::error('Name, email, and message are required.', 400);
    }

    // Resolve purpose name → purpose_id
    $purposeId = null;
    if (!empty($data['purpose'])) {
        $purposeMap = [
            'leisure'    => 1,
            'pilgrimage' => 1,   // maps to "Leisure & Tourism"
            'event'      => 1,   // maps to "Leisure & Tourism"
            'educational'=> 2,   // maps to "Educational Tour"
            'research'   => 3,   // maps to "Research & Documentation"
            'official'   => 1,   // fallback
        ];
        $purposeId = $purposeMap[strtolower($data['purpose'])] ?? null;
    }

    $success = $inquiry->create([
        'name'          => $data['name'],
        'email'         => $data['email'],
        'contactNumber' => $data['contactNumber'] ?? null,
        'type'          => 1, // general inquiry
        'purposeId'     => $purposeId,
        'dateOfVisit'   => $data['dateOfVisit'] ?? null,
        'numberOfPax'   => !empty($data['numberOfPax']) ? (int) $data['numberOfPax'] : null,
        'message'       => $data['message'],
    ]);

    if ($success) {
        Response::json([
            'message' => 'Inquiry submitted successfully.',
        ], 201);
    } else {
        Response::error('Failed to submit inquiry.', 500);
    }
} catch (Exception $e) {
    error_log("inquiries/create error: " . $e->getMessage());
    Response::error('Failed to submit inquiry.', 500);
}
