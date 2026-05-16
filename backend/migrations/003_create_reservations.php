<?php
/**
 * Migration: Create reservations table.
 * Run once: http://localhost/Licensify/backend/migrations/003_create_reservations.php
 */

$host     = 'localhost';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=licensify;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ Table 'reservations' is now managed via database/schema.sql.";
} catch (PDOException $e) {
    echo "❌ Migration failed: " . htmlspecialchars($e->getMessage());
}
