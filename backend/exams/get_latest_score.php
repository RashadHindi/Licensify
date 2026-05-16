<?php
/**
 * Get Latest Exam Result API
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

session_start();

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$student_id = $_SESSION['user']['id'];

try {
    $stmt = $pdo->prepare("
        SELECT r.*, e.title as exam_title 
        FROM exam_results r
        JOIN exams e ON r.exam_id = e.id
        WHERE r.student_id = ?
        ORDER BY r.created_at DESC
        LIMIT 1
    ");
    $stmt->execute([$student_id]);
    $latest = $stmt->fetch();

    if ($latest) {
        echo json_encode([
            'success' => true,
            'latest' => [
                'score' => (int)$latest['score'],
                'total' => (int)$latest['total_questions'],
                'percentage' => (float)$latest['percentage'],
                'date' => date('M d, Y', strtotime($latest['created_at'])),
                'title' => $latest['exam_title']
            ]
        ]);
    } else {
        echo json_encode(['success' => true, 'latest' => null]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
