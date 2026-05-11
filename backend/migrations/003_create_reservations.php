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

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `reservations` (
            `id`          INT AUTO_INCREMENT PRIMARY KEY,
            `student_id`  INT NOT NULL,
            `trainer_id`  INT NOT NULL,
            `date`        DATE NOT NULL,
            `time`        VARCHAR(10) NOT NULL,
            `status`      ENUM('Upcoming', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
            `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`trainer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
            UNIQUE KEY `unique_trainer_date_time` (`trainer_id`, `date`, `time`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    echo "✅ Table 'reservations' created (or already exists).";
} catch (PDOException $e) {
    echo "❌ Migration failed: " . htmlspecialchars($e->getMessage());
}
