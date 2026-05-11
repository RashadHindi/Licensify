<?php
/**
 * Database Setup Script for Licensify.
 * Run this ONCE in your browser: http://localhost/Licensify/backend/setup.php
 * 
 * Creates the 'licensify' database, 'users' table, and seeds
 * the same mock accounts that the frontend used to have in localStorage.
 */

$host     = 'localhost';
$username = 'root';
$password = '';

try {
    // Connect without specifying a database first
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Create the database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `licensify` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `licensify`");
    echo "✅ Database 'licensify' created (or already exists).<br>";

    // 2. Create users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `users` (
            `id`            INT AUTO_INCREMENT PRIMARY KEY,
            `fname`         VARCHAR(100) NOT NULL,
            `lname`         VARCHAR(100) NOT NULL,
            `email`         VARCHAR(255) NOT NULL UNIQUE,
            `password`      VARCHAR(255) NOT NULL,
            `phone`         VARCHAR(50)  DEFAULT NULL,
            `profile_photo` VARCHAR(500) DEFAULT NULL,
            `role`          ENUM('student', 'trainer', 'admin') NOT NULL DEFAULT 'student',
            `experience`    VARCHAR(50)  DEFAULT NULL,
            `car_type`      VARCHAR(50)  DEFAULT NULL,
            `rating`        DECIMAL(2,1) DEFAULT 0.0,
            `reviews`       INT          DEFAULT 0,
            `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Update table if it already existed (adding missing columns)
    $columnsToAdd = [
        'profile_photo' => "VARCHAR(500) DEFAULT NULL AFTER phone",
        'experience'    => "VARCHAR(50) DEFAULT NULL AFTER role",
        'car_type'      => "VARCHAR(50) DEFAULT NULL AFTER experience",
        'rating'        => "DECIMAL(2,1) DEFAULT 0.0 AFTER car_type",
        'reviews'       => "INT DEFAULT 0 AFTER rating"
    ];

    foreach ($columnsToAdd as $colName => $definition) {
        $check = $pdo->query("SHOW COLUMNS FROM users LIKE '$colName'");
        if ($check->rowCount() === 0) {
            $pdo->exec("ALTER TABLE users ADD COLUMN $colName $definition");
        }
    }
    echo "✅ Table 'users' ready with trainer metadata support.<br>";

    // 3. Create trainer_availability table
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
    echo "✅ Table 'trainer_availability' created (or already exists).<br>";

    // 4. Create reservations table
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
    echo "✅ Table 'reservations' created (or already exists).<br>";


    // 5. Seed mock data
    $defaultPass = password_hash('Password123!', PASSWORD_DEFAULT);

    $seedUsers = [
        ['Rashad',  'Hindi',   'rashadhindi2004@gmail.com',        $defaultPass, '+1 234 567 890', 'admin',   NULL,       NULL,           0.0, 0],
        ['Sarah',   'Johnson', 'sarah.trainer@licensify.com',      $defaultPass, '+1 555 0101',    'trainer', '6 Years',  'Automatic',    4.8, 95],
        ['Michael', 'Chen',    'michael.trainer@licensify.com',    $defaultPass, '+1 555 0102',    'trainer', '10 Years', 'Manual & Auto', 4.9, 128],
        ['Ahmad',   'Hassan',  'ahmad.student@gmail.com',          $defaultPass, '+1 555 0201',    'student', NULL,       NULL,           0.0, 0],
        ['Emma',    'Wilson',  'emma.student@gmail.com',            $defaultPass, '+1 555 0202',    'student', NULL,       NULL,           0.0, 0],
    ];


    $stmt = $pdo->prepare("
        INSERT IGNORE INTO `users` (fname, lname, email, password, phone, role, experience, car_type, rating, reviews)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $inserted = 0;
    foreach ($seedUsers as $u) {
        $stmt->execute($u);
        if ($stmt->rowCount() > 0) $inserted++;
    }

    echo "✅ Seeded $inserted new user(s). (Existing emails were skipped.)<br>";
    echo "<br>🎉 <strong>Setup complete!</strong> You can now use the Licensify app.<br>";
    echo "<br><strong>Test accounts (all use password: <code>Password123!</code>):</strong><br>";
    echo "<ul>";
    echo "<li><strong>Admin:</strong> rashadhindi2004@gmail.com</li>";
    echo "<li><strong>Trainer:</strong> sarah.trainer@licensify.com</li>";
    echo "<li><strong>Student:</strong> ahmad.student@gmail.com</li>";
    echo "</ul>";


} catch (PDOException $e) {
    http_response_code(500);
    echo "❌ Setup failed: " . htmlspecialchars($e->getMessage());
}
