<?php
/**
 * Get All Exam Results API
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
    ");
    $stmt->execute([$student_id]);
    $results = $stmt->fetchAll();

    $formatted = [];
    foreach ($results as $r) {
        $formatted[] = [
            'score' => (int)$r['score'],
            'total' => (int)$r['total_questions'],
            'percentage' => (float)$r['percentage'],
            'date' => date('M d, Y', strtotime($r['created_at'])),
            'title' => $r['exam_title']
        ];
    }

    echo json_encode([
        'success' => true,
        'scores' => $formatted
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
