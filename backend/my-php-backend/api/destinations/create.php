<?php

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Ensure the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

header('Content-Type: application/json');
require_once '../../config/database.php';

// Decode the JSON input
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['title'], $data['description'], $data['location'], $data['hours'], $data['contact'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$title = $data['title'];
$description = $data['description'];
$location = $data['location'];
$hours = $data['hours'];
$contact = $data['contact'];

try {
    // Start the transaction
    $pdo->beginTransaction();

    // Insert into the cms table
    $cmsQuery = "INSERT INTO cms (title, description, status) VALUES (:title, :description, 'PUBLISHED')";
    $cmsStmt = $pdo->prepare($cmsQuery);
    $cmsStmt->bindParam(':title', $title, PDO::PARAM_STR);
    $cmsStmt->bindParam(':description', $description, PDO::PARAM_STR);
    $cmsStmt->execute();

    // Get the last inserted ID
    $last_id = $pdo->lastInsertId();

    // Insert into the place table
    $placeQuery = "INSERT INTO place (place_id, location, hours, contact) VALUES (:place_id, :location, :hours, :contact)";
    $placeStmt = $pdo->prepare($placeQuery);
    $placeStmt->bindParam(':place_id', $last_id, PDO::PARAM_INT);
    $placeStmt->bindParam(':location', $location, PDO::PARAM_STR);
    $placeStmt->bindParam(':hours', $hours, PDO::PARAM_STR);
    $placeStmt->bindParam(':contact', $contact, PDO::PARAM_STR);
    $placeStmt->execute();

    // Commit the transaction
    $pdo->commit();

    // Return success response
    http_response_code(201);
    echo json_encode(['message' => 'Destination created successfully']);
} catch (PDOException $e) {
    // Roll back the transaction on error
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create destination: ' . $e->getMessage()]);
}
