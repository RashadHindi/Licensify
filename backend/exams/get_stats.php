<?php
/**
 * Get Student Exam Stats API
 * Determines Practice Test status based on performance.
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
    // 1. Total unique exams attempted
    $stmtTotal = $pdo->prepare("SELECT COUNT(DISTINCT exam_id) as count FROM exam_results WHERE student_id = ?");
    $stmtTotal->execute([$student_id]);
    $total_attempted = (int)$stmtTotal->fetch()['count'];

    // 2. Total unique exams passed (80%+)
    $stmtPassed = $pdo->prepare("SELECT COUNT(DISTINCT exam_id) as count FROM exam_results WHERE student_id = ? AND percentage >= 80");
    $stmtPassed->execute([$student_id]);
    $total_passed = (int)$stmtPassed->fetch()['count'];

    echo json_encode([
        'success' => true,
        'total_attempted' => $total_attempted,
        'total_passed' => $total_passed
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
