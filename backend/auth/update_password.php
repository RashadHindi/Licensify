<?php
/**
 * Update password endpoint for Licensify.
 * POST /backend/auth/update_password.php
 * 
 * Expects JSON body: { current_password, new_password }
 * Returns JSON: { success, message }
 * 
 * Used by settings pages to change the logged-in user's password.
 * Verifies current password, then updates to the new hashed password.
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

// Must be logged in
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$data        = json_decode(file_get_contents('php://input'), true);
$currentPass = $data['current_password'] ?? '';
$newPass     = $data['new_password'] ?? '';

if (!$currentPass || !$newPass) {
    echo json_encode(['success' => false, 'message' => 'Both current and new passwords are required.']);
    exit;
}

// Password strength check
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/', $newPass)) {
    echo json_encode(['success' => false, 'message' => 'New password does not meet strength requirements.']);
    exit;
}

// Verify current password
$stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user']['id']]);
$row = $stmt->fetch();

if (!$row || !password_verify($currentPass, $row['password'])) {
    echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
    exit;
}

// Update to new password
$hashedPass = password_hash($newPass, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
$stmt->execute([$hashedPass, $_SESSION['user']['id']]);

echo json_encode(['success' => true, 'message' => 'Password updated successfully.']);
