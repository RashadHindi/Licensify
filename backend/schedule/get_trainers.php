<?php
/**
 * Get all trainers from the database.
 * GET /backend/schedule/get_trainers.php
 * 
 * Returns JSON: { success, trainers: [{ id, fname, lname, email, phone, profile_photo }] }
 * Public endpoint - no authentication required.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/db.php';

$stmt = $pdo->prepare("SELECT id, fname, lname, email, phone, profile_photo, experience, car_type, rating, reviews FROM users WHERE role = 'trainer' ORDER BY fname, lname");
$stmt->execute();
$trainers = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Cast id to int and numerical values
foreach ($trainers as &$t) {
    $t['id'] = (int) $t['id'];
    $t['rating'] = (float) $t['rating'];
    $t['reviews'] = (int) $t['reviews'];
}

echo json_encode(['success' => true, 'trainers' => $trainers]);
