<?php
/**
 * Signup endpoint for Licensify.
 * POST /backend/auth/signup.php
 * 
 * Expects JSON body: { fname, lname, email, phone, password }
 * Returns JSON: { success, user } or { success, message }
 * 
 * Hashes the password with bcrypt, inserts the new user as 'student',
 * starts a PHP session, and returns user data for the frontend.
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

require_once __DIR__ . '/../config/db.php';

$data  = json_decode(file_get_contents('php://input'), true);
$fname = trim($data['fname'] ?? '');
$lname = trim($data['lname'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$pass  = $data['password'] ?? '';

// Validation
if (!$fname || !$lname || !$email || !$pass) {
    echo json_encode(['success' => false, 'message' => 'All required fields must be filled.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
    exit;
}

// Password strength (same regex as frontend)
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/', $pass)) {
    echo json_encode(['success' => false, 'message' => 'Password does not meet strength requirements.']);
    exit;
}

// Check duplicate email
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'An account with this email already exists.']);
    exit;
}

// Hash and insert
$hashedPass = password_hash($pass, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('INSERT INTO users (fname, lname, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)');
$stmt->execute([$fname, $lname, $email, $hashedPass, $phone, 'student']);

$userId = (int) $pdo->lastInsertId();

// Build session/response object
$sessionUser = [
    'id'    => $userId,
    'fname' => $fname,
    'lname' => $lname,
    'email' => $email,
    'phone' => $phone,
    'role'  => 'student'
];

$_SESSION['user'] = $sessionUser;

echo json_encode(['success' => true, 'user' => $sessionUser]);
