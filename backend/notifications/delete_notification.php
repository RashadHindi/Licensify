<?php
/**
 * Delete a notification for the logged-in user.
 * POST /backend/notifications/delete_notification.php
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$notificationId = $data['id'] ?? 0;
$userId = $_SESSION['user']['id'];

if (!$notificationId) {
    echo json_encode(['success' => false, 'message' => 'Missing notification ID.']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?");
    $stmt->execute([$notificationId, $userId]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
