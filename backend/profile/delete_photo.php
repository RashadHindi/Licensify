<?php
/**
 * Delete profile photo endpoint for Licensify.
 * POST /backend/profile/delete_photo.php
 * 
 * Returns JSON: { success, message }
 * 
 * Deletes the photo file from disk and clears the path in DB.
 * Requires an active PHP session.
 */

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$userId = $_SESSION['user']['id'];

// Get current photo path
$stmt = $pdo->prepare('SELECT profile_photo FROM users WHERE id = ?');
$stmt->execute([$userId]);
$photoPath = $stmt->fetchColumn();

// Delete file from disk
if ($photoPath) {
    $filePath = __DIR__ . '/../../' . $photoPath;
    if (file_exists($filePath)) {
        unlink($filePath);
    }
}

// Clear in database
$stmt = $pdo->prepare('UPDATE users SET profile_photo = NULL WHERE id = ?');
$stmt->execute([$userId]);

// Update session
$_SESSION['user']['profile_photo'] = null;

echo json_encode(['success' => true, 'message' => 'Photo deleted successfully.']);
