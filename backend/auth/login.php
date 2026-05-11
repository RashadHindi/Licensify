<?php
/**
 * Login endpoint for Licensify.
 * POST /backend/auth/login.php
 * 
 * Expects JSON body: { email, password }
 * Returns JSON: { success, user } or { success, message }
 * 
 * On success, starts a PHP session and returns user data
 * (without the password hash) for the frontend to store.
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
$email = trim($data['email'] ?? '');
$pass  = $data['password'] ?? '';

// Basic validation
if (!$email || !$pass) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

// Look up user by email
$stmt = $pdo->prepare('SELECT id, fname, lname, email, password, phone, role, profile_photo, experience, car_type, rating, reviews FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($pass, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    exit;
}

// Build the session/response user object (never expose the hash)
$sessionUser = [
    'id'            => (int) $user['id'],
    'fname'         => $user['fname'],
    'lname'         => $user['lname'],
    'email'         => $user['email'],
    'phone'         => $user['phone'],
    'role'          => $user['role'],
    'profile_photo' => $user['profile_photo'],
    'experience'    => $user['experience'],
    'car_type'      => $user['car_type'],
    'rating'        => (float) $user['rating'],
    'reviews'       => (int) $user['reviews']
];

$_SESSION['user'] = $sessionUser;

echo json_encode(['success' => true, 'user' => $sessionUser]);
