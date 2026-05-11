<?php
/**
 * Get notifications for the logged-in user.
 * GET /backend/notifications/get_notifications.php
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$userId = $_SESSION['user']['id'];

try {
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = [];
    foreach ($notifications as $n) {
        $formatted[] = [
            'id'    => $n['id'],
            'title' => $n['title'],
            'text'  => $n['message'],
            'icon'  => $n['icon'],
            'color' => $n['color'],
            'bg'    => $n['bg']
        ];
    }

    echo json_encode(['success' => true, 'notifications' => $formatted]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
