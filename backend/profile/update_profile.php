<?php
/**
 * Update profile information endpoint for Licensify.
 * POST /backend/profile/update_profile.php
 * 
 * Expects JSON body: { fname, lname, phone }
 * Returns JSON: { success, message, user }
 * 
 * Updates the logged-in user's first name, last name, and phone number.
 * Requires an active PHP session.
 */

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$data  = json_decode(file_get_contents('php://input'), true);
$fname = trim($data['fname'] ?? '');
$lname = trim($data['lname'] ?? '');
$phone = trim($data['phone'] ?? '');

// All fields are required
if (!$fname || !$lname || !$phone) {
    echo json_encode(['success' => false, 'message' => 'First name, last name, and phone number are all required.']);
    exit;
}

// Validate name (letters and spaces only)
if (!preg_match('/^[a-zA-Z\s]+$/', $fname)) {
    echo json_encode(['success' => false, 'message' => 'First name should only contain letters.']);
    exit;
}
if (!preg_match('/^[a-zA-Z\s]+$/', $lname)) {
    echo json_encode(['success' => false, 'message' => 'Last name should only contain letters.']);
    exit;
}

// Validate phone (digits, +, -, spaces, parentheses)
if (!preg_match('/^[0-9\+\-\s\(\)]+$/', $phone)) {
    echo json_encode(['success' => false, 'message' => 'Please enter a valid phone number.']);
    exit;
}

$userId = $_SESSION['user']['id'];

// Update in database
$stmt = $pdo->prepare('UPDATE users SET fname = ?, lname = ?, phone = ? WHERE id = ?');
$stmt->execute([$fname, $lname, $phone, $userId]);

// Update session
$_SESSION['user']['fname'] = $fname;
$_SESSION['user']['lname'] = $lname;
$_SESSION['user']['phone'] = $phone;

echo json_encode([
    'success' => true,
    'message' => 'Profile updated successfully.',
    'user'    => $_SESSION['user']
]);
