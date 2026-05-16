<?php
require_once __DIR__ . '/../config/db.php';

try {
    // Create notifications table
    echo "Migration 007: 'notifications' table is now managed via database/schema.sql.<br>";
} catch (PDOException $e) {
    die("Migration failed: " . $e->getMessage());
}
?>
