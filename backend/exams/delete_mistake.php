<?php
/**
 * Delete Exam Mistake API
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
$question_id = $data['id'] ?? null;

if (!$question_id) {
    echo json_encode(['success' => false, 'message' => 'Question ID is required.']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM exam_mistakes WHERE student_id = ? AND question_id = ?");
    $stmt->execute([$student_id, $question_id]);
    echo json_encode(['success' => true, 'message' => 'Mistake dismissed.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
