<?php
/**
 * POST /api/inquiries/create.php
 * Public endpoint — creates a new inquiry from the tourist site form.
 *
 * Body: {
 *   name: string,
 *   email: string,
 *   contactNumber?: string,
 *   inquiryType?: string ('general_contact' | 'tour_booking' | 'partnership'),
 *   dateOfVisit?: string (YYYY-MM-DD),
 *   numberOfPax?: number,
 *   message: string,
 *   additionalDetails?: { schoolName?, companyName?, referralSource?, dietaryNeeds?, ... }
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
