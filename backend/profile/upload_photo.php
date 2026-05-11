<?php
/**
 * Upload profile photo endpoint for Licensify.
 * POST /backend/profile/upload_photo.php
 * 
 * Expects JSON body: { photo } (base64 data URL)
 * Returns JSON: { success, photo_path }
 * 
 * Decodes the base64 image, saves to disk, stores path in DB.
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

$data = json_decode(file_get_contents('php://input'), true);
$photoData = $data['photo'] ?? '';

if (!$photoData) {
    echo json_encode(['success' => false, 'message' => 'No photo data provided.']);
    exit;
}

// Parse the base64 data URL: "data:image/png;base64,iVBOR..."
if (!preg_match('/^data:image\/(jpeg|jpg|png|gif|webp);base64,(.+)$/i', $photoData, $matches)) {
    echo json_encode(['success' => false, 'message' => 'Invalid image format.']);
    exit;
}

$extension = strtolower($matches[1]);
if ($extension === 'jpg') $extension = 'jpeg';
$imageBytes = base64_decode($matches[2]);

if ($imageBytes === false) {
    echo json_encode(['success' => false, 'message' => 'Failed to decode image.']);
    exit;
}

// Limit file size to 5MB
if (strlen($imageBytes) > 5 * 1024 * 1024) {
    echo json_encode(['success' => false, 'message' => 'Image too large. Maximum 5MB allowed.']);
    exit;
}

// Ensure uploads directory exists
$uploadsDir = __DIR__ . '/../uploads/photos';
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

// Delete old photo if exists
$userId = $_SESSION['user']['id'];
$stmt = $pdo->prepare('SELECT profile_photo FROM users WHERE id = ?');
$stmt->execute([$userId]);
$oldPhoto = $stmt->fetchColumn();
if ($oldPhoto) {
    $oldFilePath = __DIR__ . '/../../' . $oldPhoto;
    if (file_exists($oldFilePath)) {
        unlink($oldFilePath);
    }
}

// Save new file
$filename = 'user_' . $userId . '_' . time() . '.' . $extension;
$filePath = $uploadsDir . '/' . $filename;
file_put_contents($filePath, $imageBytes);

// Relative path from project root (for use in <img src="...">)
$relativePath = 'backend/uploads/photos/' . $filename;

// Update database
$stmt = $pdo->prepare('UPDATE users SET profile_photo = ? WHERE id = ?');
$stmt->execute([$relativePath, $userId]);

// Update session
$_SESSION['user']['profile_photo'] = $relativePath;

echo json_encode(['success' => true, 'photo_path' => $relativePath]);
