<?php
/**
 * Get Recent Exam Mistakes API
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
        SELECT DISTINCT q.*, c.name as category_name
        FROM exam_mistakes m
        JOIN exam_questions q ON m.question_id = q.id
        JOIN exams e ON q.exam_id = e.id
        JOIN categories c ON e.category = c.id
        WHERE m.student_id = ?
        ORDER BY m.created_at DESC
        LIMIT 5
    ");
    $stmt->execute([$student_id]);
    $mistakes = $stmt->fetchAll();

    $formatted = [];
    foreach ($mistakes as $m) {
        $formatted[] = [
            'id' => $m['id'],
            'text' => $m['question_text'],
            'topic' => $m['category_name'],
            'explanation' => $m['explanation'],
            'correctAnswer' => [$m['option_a'], $m['option_b'], $m['option_c'], $m['option_d']][$m['correct_answer']]
        ];
    }

    echo json_encode([
        'success' => true,
        'mistakes' => $formatted
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
