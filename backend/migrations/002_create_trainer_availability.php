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

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `trainer_availability` (
            `id`         INT AUTO_INCREMENT PRIMARY KEY,
            `trainer_id` INT NOT NULL,
            `date`       DATE NOT NULL,
            `type`       ENUM('day_off', 'slot_off') NOT NULL,
            `slot_hour`  VARCHAR(10) DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`trainer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
            UNIQUE KEY `unique_trainer_date_slot` (`trainer_id`, `date`, `slot_hour`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    echo "✅ Table 'trainer_availability' created (or already exists).";
} catch (PDOException $e) {
    echo "❌ Migration failed: " . htmlspecialchars($e->getMessage());
}
