<?php
// 1. CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// 2. Handle OPTIONS preflight request (For Next.js)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 3. Ensure the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

// 4. Bring in the Engine and the Brains
require_once '../../config/database.php';
require_once '../../models/Destination.php';

// 5. Decode the JSON input from the frontend
$data = json_decode(file_get_contents('php://input'), true);

// 6. Validate input
if (empty($data['title']) || empty($data['description']) || empty($data['location']) || empty($data['hours']) || empty($data['contact'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Incomplete data. Please fill all fields.']);
    exit;
}

try {
    // 7. Initialize Database and Model
    $database = new Database();
    $db = $database->getConnection();
    
    $destination = new Destination($db);

    // 8. Handle the required user_id
    // Note: We are hardcoding user 1 for now. 
    // Later, you will grab this dynamically from the logged-in admin's token!
    $user_id = 1; 

    // 9. Call the model's create function
    if ($destination->create($user_id, $data['title'], $data['description'], $data['location'], $data['hours'], $data['contact'])) {
        // 201 means "Created successfully"
        http_response_code(201);
        echo json_encode(['message' => 'Tourist spot created successfully!']);
    } else {
        // 503 means "Service Unavailable"
        http_response_code(503);
        echo json_encode(['error' => 'Unable to create tourist spot. Database transaction failed.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>