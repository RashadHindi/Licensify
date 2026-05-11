<?php
/**
 * Fix: restore original 2 trainers, remove any extras, add metadata.
 * Run once: http://localhost/Licensify/backend/migrations/005_fix_trainers.php
 */

require_once __DIR__ . '/../config/db.php';

// 1. Remove John Smith if he was added
$stmt = $pdo->prepare("DELETE FROM users WHERE email = 'john.trainer@licensify.com'");
$stmt->execute();
echo ($stmt->rowCount() > 0 ? "🗑️ Removed John Smith." : "ℹ️ John Smith not found (already clean).") . "<br>";

// 2. Update Sarah back to original name + add metadata
$stmt = $pdo->prepare("UPDATE users SET fname='Sarah', lname='Johnson', experience='6 Years', car_type='Automatic', rating=4.8, reviews=95 WHERE email='sarah.trainer@licensify.com'");
$stmt->execute();
echo "✅ Sarah Johnson updated with metadata.<br>";

// 3. Update Michael back to original name + add metadata
$stmt = $pdo->prepare("UPDATE users SET fname='Michael', lname='Chen', experience='10 Years', car_type='Manual & Auto', rating=4.9, reviews=128 WHERE email='michael.trainer@licensify.com'");
$stmt->execute();
echo "✅ Michael Chen updated with metadata.<br>";

echo "<br>🎉 Done! 2 trainers in the database.";
