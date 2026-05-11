<?php
/**
 * Logout endpoint for Licensify.
 * POST /backend/auth/logout.php
 * 
 * Destroys the PHP session.
 * Returns JSON: { success, message }
 */

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

session_unset();
session_destroy();

echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);
