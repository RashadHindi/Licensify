<?php
/**
 * Password reset endpoint for Licensify.
 * POST /backend/auth/reset_password.php
 * 
 * Expects JSON body: { email, password }
 * Returns JSON: { success, message }
 * 
 * Updates the password for the given email after the user has
 * verified their identity through the verification code flow.
 */

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

require_once __DIR__ . '/../config/db.php';

$data  = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$pass  = $data['password'] ?? '';

if (!$email || !$pass) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

// Password strength check (same as signup)
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/', $pass)) {
    echo json_encode(['success' => false, 'message' => 'Password does not meet strength requirements.']);
    exit;
}

$hashedPass = password_hash($pass, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('UPDATE users SET password = ? WHERE email = ?');
$stmt->execute([$hashedPass, $email]);

if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => true, 'message' => 'Password updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'No account found with that email.']);
}
