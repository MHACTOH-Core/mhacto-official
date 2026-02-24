<?php
// login.php - Handles user login
// ...implementation here...

// 1. CORS Headers (Essential so Next.js doesn't get blocked)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle the pre-flight security check from the browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Bring in your working global $pdo connection
require_once '../../config/database.php';

// 3. Block any request that isn't a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Please use POST."]);
    exit();
}

// 4. Read the raw JSON data sent from Next.js or cURL
$data = json_decode(file_get_contents("php://input"));

// 5. Check if the user actually provided an email and password
if (empty($data->email) || empty($data->password)) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "Please provide both email and password."]);
    exit();
}

try {
    // 6. Fetch the user from the database (Notice the capital 'U' for your User table!)
    $query = "SELECT * FROM User WHERE email = :email LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 7. Verify the user exists AND the password matches the bcrypt hash in the database
    if ($user && password_verify($data->password, $user['password_hash'])) {
        
        // SECURITY BEST PRACTICE: Never send the password hash back to the frontend!
        unset($user['password_hash']);
        
        http_response_code(200); // OK
        echo json_encode([
            "message" => "Login successful",
            "user" => $user
        ]);
    } else {
        http_response_code(401); // Unauthorized
        echo json_encode(["error" => "Invalid email or password."]);
    }

} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>