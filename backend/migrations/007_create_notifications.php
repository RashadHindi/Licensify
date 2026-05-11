<?php
require_once __DIR__ . '/../config/db.php';

try {
    // Create notifications table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) NOT NULL DEFAULT 'info', /* feedback, booking, alert */
            icon VARCHAR(50) DEFAULT 'bi-bell',
            color VARCHAR(50) DEFAULT 'text-primary',
            bg VARCHAR(50) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    echo "Migration 007: 'notifications' table created successfully.<br>";
} catch (PDOException $e) {
    die("Migration failed: " . $e->getMessage());
}
?>
