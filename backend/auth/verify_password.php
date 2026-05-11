<?php
/**
 * Verify current password endpoint for Licensify.
 * POST /backend/auth/verify_password.php
 * 
 * Expects JSON body: { password }
 * Returns JSON: { success, valid }
 * 
 * Used by the settings pages to verify the user's current password
 * before allowing a password change. Requires an active PHP session.
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

$data = json_decode(file_get_contents('php://input'), true);
$pass = $data['password'] ?? '';

if (!$pass) {
    echo json_encode(['success' => false, 'message' => 'Password is required.']);
    exit;
}

// Look up the user's hashed password from the database
$stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user']['id']]);
$row = $stmt->fetch();

if ($row && password_verify($pass, $row['password'])) {
    echo json_encode(['success' => true, 'valid' => true]);
} else {
    echo json_encode(['success' => true, 'valid' => false]);
}
