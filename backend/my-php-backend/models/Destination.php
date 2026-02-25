<?php
// models/Destination.php

class Destination {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // 1. The READ function
    public function readAll() {
        $query = "SELECT c.content_id, c.title, c.description, c.status, p.location, p.hours, p.contact 
                  FROM cms c 
                  JOIN place p ON c.content_id = p.place_id 
                  WHERE c.status = 'PUBLISHED'";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // 2. The CREATE function
    public function create($user_id, $title, $description, $location, $hours, $contact) {
        try {
            $this->conn->beginTransaction();

            $query_cms = "INSERT INTO cms (user_id, title, description, status) 
                          VALUES (:user_id, :title, :description, 'PUBLISHED')";
            $stmt_cms = $this->conn->prepare($query_cms);
            
            $title = htmlspecialchars(strip_tags($title));
            $description = htmlspecialchars(strip_tags($description));
            
            $stmt_cms->bindParam(':user_id', $user_id);
            $stmt_cms->bindParam(':title', $title);
            $stmt_cms->bindParam(':description', $description);
            $stmt_cms->execute();

            $new_content_id = $this->conn->lastInsertId();

            $query_place = "INSERT INTO place (place_id, location, hours, contact) 
                            VALUES (:place_id, :location, :hours, :contact)";
            $stmt_place = $this->conn->prepare($query_place);
            
            $location = htmlspecialchars(strip_tags($location));
            $hours = htmlspecialchars(strip_tags($hours));
            $contact = htmlspecialchars(strip_tags($contact));
            
            $stmt_place->bindParam(':place_id', $new_content_id);
            $stmt_place->bindParam(':location', $location);
            $stmt_place->bindParam(':hours', $hours);
            $stmt_place->bindParam(':contact', $contact);
            $stmt_place->execute();

            $this->conn->commit();
            return true;

        } catch (PDOException $exception) {
            $this->conn->rollBack();

            echo "MARIADB ERROR: " . $exception->getMessage();
            
            return false;
        }
    }
}
?>