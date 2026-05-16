<?php
/**
 * Migration: Create trainer_availability table.
 * Run once: http://localhost/Licensify/backend/migrations/002_create_trainer_availability.php
 */

$host     = 'localhost';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=licensify;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ Table 'trainer_availability' is now managed via database/schema.sql.";
} catch (PDOException $e) {
    echo "❌ Migration failed: " . htmlspecialchars($e->getMessage());
}
