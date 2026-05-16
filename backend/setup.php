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

    // 1. Select the database
    $pdo->exec("USE `licensify` ");
    echo "✅ Using database 'licensify'.<br>";

    // Seeding logic follows...
<br>";


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
