<?php
/**
 * Save Exam Result API
 * Persistent storage for student test results.
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

session_start();

// Ensure the user is logged in - using the correct session key 'user'
if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    exit;
}

$student_id = $_SESSION['user']['id'];
$data = json_decode(file_get_contents('php://input'), true);

$exam_id = $data['exam_id'] ?? null;
$score = $data['score'] ?? null;
$total_questions = $data['total_questions'] ?? null;
$percentage = $data['percentage'] ?? null;
$mistakes = $data['mistakes'] ?? []; // Array of question IDs

if (!$exam_id || $score === null || !$total_questions || $percentage === null) {
    echo json_encode(['success' => false, 'message' => 'Missing required data.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Insert the result
    $stmt = $pdo->prepare("INSERT INTO exam_results (student_id, exam_id, score, total_questions, percentage) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$student_id, $exam_id, $score, $total_questions, $percentage]);

    // 3. Update 'practice-test' status in student_progress
    // Count total unique exams attempted
    $stmtTotal = $pdo->prepare("SELECT COUNT(DISTINCT exam_id) as count FROM exam_results WHERE student_id = ?");
    $stmtTotal->execute([$student_id]);
    $totalAttempted = (int)$stmtTotal->fetch()['count'];

    // Count unique exams passed (80%+)
    $stmtPassed = $pdo->prepare("SELECT COUNT(DISTINCT exam_id) as count FROM exam_results WHERE student_id = ? AND percentage >= 80");
    $stmtPassed->execute([$student_id]);
    $totalPassed = (int)$stmtPassed->fetch()['count'];
    
    $newStatus = 'not-started';
    if ($totalPassed >= 3) {
        $newStatus = 'completed';
    } else if ($totalAttempted > 0) {
        $newStatus = 'in-progress';
    }
    
    $stmtProgress = $pdo->prepare("
        INSERT INTO student_progress (student_id, topic_id, status) 
        VALUES (?, 'practice-test', ?) 
        ON DUPLICATE KEY UPDATE status = VALUES(status)
    ");
    $stmtProgress->execute([$student_id, $newStatus]);

    // 4. Track mistakes
    if (!empty($mistakes)) {
        $stmtMistake = $pdo->prepare("INSERT IGNORE INTO exam_mistakes (student_id, question_id) VALUES (?, ?)");
        foreach ($mistakes as $q_id) {
            if (is_numeric($q_id)) {
                $stmtMistake->execute([$student_id, $q_id]);
            }
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Test result saved to database.']);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
