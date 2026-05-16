<?php
/**
 * Save Student Study Progress API
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

session_start();

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$student_id = $_SESSION['user']['id'];
$data = json_decode(file_get_contents('php://input'), true);

$topic_id = $data['topic_id'] ?? null;
$status = $data['status'] ?? 'not-started';
$completed_items = $data['completed_items'] ?? 0;

if (!$topic_id) {
    echo json_encode(['success' => false, 'message' => 'Topic ID is required.']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO student_progress (student_id, topic_id, status, completed_items)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status), completed_items = VALUES(completed_items)
    ");
    $stmt->execute([$student_id, $topic_id, $status, $completed_items]);

    echo json_encode(['success' => true, 'message' => 'Progress saved.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
